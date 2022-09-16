import parseReplay from "@process-replay/parse-replay";
import writeReplay from "@process-replay/write-replay";
import { Version } from "@process-replay/version";
import CommandsStream from "@process-replay/commands/commands-stream";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";

import fs from "fs";
import Chk from "bw-chk";

import { OpenBW } from "common/types";
import { GameTypes } from "common/enums";
import { openFile } from "@ipc";
import * as log from "@ipc/log";
import settingsStore from "@stores/settings-store";
import processStore, { Process } from "@stores/process-store";
import { makeGameScene } from "./game-scene/game-scene";
import Janitor from "@utils/janitor";
import { useReplayAndMapStore } from "@stores";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { rendererIsDev } from "@utils/renderer-utils";
import { sanityCheckCommands, writeCommands } from "@process-replay/write-commands";
import { detectMeleeObservers } from "@utils/replay-utils";
import { preloadMapUnitsAndSprites } from "@utils/preload-map-units-and-sprites";
import { SceneState } from "./scene";
import { Assets } from "@image/assets";
import gameStore from "@stores/game-store";
import { waitForTruthy } from "@utils/wait-for";
import { music } from "@audio/music";

export const replaySceneLoader = async (filepath: string): Promise<SceneState> => {

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

  document.title = "Titan Reactor";

  const sanityCheck = settings.utilities.sanityCheckReplayCommands ? sanityCheckCommands(replay, true) : [];

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

  if (replay.header.gameType === GameTypes.Melee && settings.utilities.detectMeleeObservers) {

    const meleeObservers = detectMeleeObservers(settings.utilities.detectMeleeObserversThreshold, new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer));

    replay.header.players = replay.header.players.filter(p => !meleeObservers.includes(p.id));

  }

  const map = new Chk(replay.chk);

  cleanMapTitles(map);

  const gameTitle = `${map.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`

  log.info(`@load-replay/game: ${gameTitle}`);
  log.info(`@load-replay/game-type: ${GameTypes[replay.header.gameType]}`);

  useReplayAndMapStore.setState({ replay, map, mapImage: await createMapImage(map) });
  janitor.mop(() => useReplayAndMapStore.getState().reset())

  // wait for initial assets to load
  const assets = await waitForTruthy<Assets>(() => gameStore().assets);

  // wait for initial assets to load
  if (settingsStore().data.graphics.preload) {
    await preloadMapUnitsAndSprites(assets, map, replay);
  }

  const disposeScene = await makeGameScene(
    map,
    janitor,
    new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer),
    (openBW: OpenBW) => {

      openBW.setUnitLimits(replay.limits.units);
      openBW.loadReplay(replayBuffer);

      return replay.header.players.map(player => ({
        id: player.id,
        name: player.name,
        color: player.color,
        race: player.race
      }));
    }
  );

  document.title = `Titan Reactor - ${gameTitle}`;

  processStore().complete(Process.ReplayInitialization);

  return {
    id: "@replay",
    start: () => {
      music.playGame();
    },
    dispose: () => {
      music.stop();
      disposeScene();
    }
  };

};