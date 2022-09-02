import parseReplay from "@process-replay/parse-replay";
import writeReplay from "@process-replay/write-replay";
import { Version } from "@process-replay/version";
import CommandsStream from "@process-replay/commands/commands-stream";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";
import { AudioListener } from "three";

import fs from "fs";
import Chk from "bw-chk";

import { AssetTextureResolution, UnitTileScale } from "common/types";
import { GameTypes } from "common/enums";
import { SoundChannels, Music, mixer } from "@audio";
import { openFile } from "@ipc";
import * as log from "@ipc/log";
import { BaseScene } from "@render";
import chkToTerrainMesh from "@image/generate-map/chk-to-terrain-mesh";
import settingsStore from "@stores/settings-store";
import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import { replayScene } from "./replay-scene";
import { waitForTruthy } from "@utils/wait-for-process";
import Janitor from "@utils/janitor";
import { getOpenBW } from "@openbw";
import { UnitsBufferView } from "@buffer-view";
import { useWorldStore } from "@stores";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { rendererIsDev } from "@utils/renderer-utils";
import {
  readCascFile,
} from "common/utils/casclib";
import { sanityCheckCommands, writeCommands } from "@process-replay/write-commands";
import { setDumpUnitCall } from "@plugins/plugin-system-ui";
import { calculateImagesFromSpritesIscript } from "../../utils/images-from-iscript";
import { CMDS } from "@process-replay/commands/commands";
import { Assets } from "common/types";
import { detectMeleeObservers } from "@utils/replay-utils";

export const replaySceneLoader = async (filepath: string) => {
  processStore().start(Process.ReplayInitialization);

  log.info(`@load-replay/file: ${filepath}`);

  const janitor = new Janitor();
  const settings = settingsStore().data;

  let replayBuffer = await openFile(filepath);
  let replay = await parseReplay(replayBuffer);

  if (replay.header.players.some(player => player.isComputer)) {
    throw new Error("Replays with computer players are not currently supported.");
  }

  processStore().increment(Process.ReplayInitialization);
  document.title = "Titan Reactor - Loading";

  const openBw = await getOpenBW();
  await openBw.start(readCascFile);
  setDumpUnitCall((id) => openBw.get_util_funcs().dump_unit(id));

  const sanityCheck = settings.util.sanityCheckReplayCommands ? sanityCheckCommands(replay, true) : [];

  if (sanityCheck.length) {
    sanityCheck.forEach((command, i) => i < 10 && log.warning(`@sanity-check/${command.reason}: ${JSON.stringify(command)}`));
    if (sanityCheck.length > 10) {
      log.warning(`@load-replay/sanity-check: ${sanityCheck.length} total invalid commands found`);
    }
  }

  if (replay.version !== Version.titanReactor) {
    const chkDowngrader = new ChkDowngrader();
    const chk = chkDowngrader.downgrade(replay.chk.slice(0));
    const rawCmds = sanityCheck.length ? writeCommands(replay, []) : replay.rawCmds;

    replayBuffer = await writeReplay(replay.rawHeader, rawCmds, chk, replay.limits);
    if (rendererIsDev) {
      fs.writeFileSync(`D:\\last_replay.rep`, replayBuffer);
    }
    replay = await parseReplay(replayBuffer);
  }

  replay.header.players = replay.header.players.filter(p => p.isActive);

  if (replay.header.gameType === GameTypes.Melee) {
    const meleeObservers = detectMeleeObservers(new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer));
    replay.header.players = replay.header.players.filter(p => !meleeObservers.includes(p.id));
  }

  processStore().increment(Process.ReplayInitialization);
  UnitsBufferView.unit_generation_size = replay.limits.units === 1700 ? 5 : 3;

  const map = new Chk(replay.chk);
  cleanMapTitles(map);

  const gameTitle = `${map.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`

  log.info(`@load-replay/game: ${gameTitle}`);
  log.info(`@load-replay/game-type: ${GameTypes[replay.header.gameType]}`);

  useWorldStore.setState({ replay, map, mapImage: await createMapImage(map) });
  janitor.add(() => useWorldStore.getState().reset())

  processStore().increment(Process.ReplayInitialization);

  const { terrain, extra } = await chkToTerrainMesh(
    map, {
    textureResolution: settings.assets.terrain === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD,
    anisotropy: settings.graphics.anisotropy,
    shadows: settings.graphics.terrainShadows
  }
  );

  const assets = await waitForTruthy<Assets>(() => gameStore().assets);

  const scene = new BaseScene(map.size[0], map.size[1], terrain);
  scene.background = assets.skyBox;
  scene.environment = assets.envMap;
  janitor.object3d(scene);
  janitor.disposable(scene);

  processStore().increment(Process.ReplayInitialization);

  openBw.loadReplay(replayBuffer);

  processStore().increment(Process.ReplayInitialization);
  const races = ["terran", "zerg", "protoss"];

  processStore().increment(Process.ReplayInitialization);

  const soundChannels = new SoundChannels();
  const music = janitor.add(new Music(races, mixer as unknown as AudioListener));

  processStore().increment(Process.ReplayInitialization);

  const preloadCommands = new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer);
  const preloadCommandTypes = [CMDS.TRAIN.id, CMDS.UNIT_MORPH.id, CMDS.BUILDING_MORPH.id, CMDS.BUILD.id];
  const preloadCommandUnits = new Set<number>();

  for (const command of preloadCommands.generate()) {
    if (typeof command !== "number") {
      if (preloadCommandTypes.includes(command.id)) {
        preloadCommandUnits.add(command.unitTypeId!);
      }
    }
  }

  if (settings.assets.preload) {
    const unitSprites = new Set(map.units.map(u => u.sprite).filter(s => Number.isInteger(s)) as number[]);
    const allSprites = [...preloadCommandUnits, ...unitSprites, ...new Set(map.sprites.map(s => s.spriteId))];
    const allImages = calculateImagesFromSpritesIscript(assets.bwDat, allSprites);

    log.verbose(`@load-replay/preload-images: ${allImages.length}`);
    processStore().start(Process.AtlasPreload, allImages.length);

    await Promise.all(allImages.map((imageId) => assets.loadImageAtlas(imageId, settings.assets.images === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD2).then(() => processStore().increment(Process.AtlasPreload))));
    processStore().complete(Process.AtlasPreload);
  }

  music.playGame();

  const state = await replayScene(
    map,
    terrain,
    extra,
    scene,
    assets,
    janitor,
    replay,
    soundChannels,
    new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer),
  );

  document.title = `Titan Reactor - ${gameTitle}`;

  processStore().complete(Process.ReplayInitialization);

  return state;

};
