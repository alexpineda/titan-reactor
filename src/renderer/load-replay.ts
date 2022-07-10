import parseReplay, { Replay } from "./process-replay/parse-replay";
import writeReplay from "./process-replay/write-replay";
import { Version } from "./process-replay/version";
import CommandsStream from "./process-replay/commands/commands-stream";
import ChkDowngrader from "./process-replay/chk/chk-downgrader";

import fs from "fs";
import Chk from "bw-chk";
import { strict as assert } from "assert";

import { ScreenType } from "common/types";
import { pxToMapMeter } from "common/utils/conversions";

import { ImageHD } from "./core";
import { MainMixer, SoundChannels, Music } from "./audio";
import OpenBwWasmReader from "./openbw/openbw-reader";
import { openFile } from "./ipc";
import * as log from "./ipc/log";
import { Scene } from "./render";
import loadTerrain from "./image/generate-map/load-terrain";
import settingsStore from "./stores/settings-store";
import gameStore from "./stores/game-store";
import screenStore from "./stores/screen-store";
import processStore, { Process } from "./stores/process-store";
import TitanReactorGame from "./view-replay";
import waitForAssets from "./bootup/wait-for-assets";
import Janitor from "./utils/janitor";
import { openBw } from "./openbw";
import UnitsBufferView from "./buffer-view/units-buffer-view";
import { useWorldStore } from "@stores";
import { cleanMapTitles } from "@utils/map-string-utils";
import rendererIsDev from "@utils/renderer-is-dev";
import {
  readCascFile,
} from "common/utils/casclib";
import { callHookAsync } from "./plugins";
import { HOOK_ON_SCENE_PREPARED } from "./plugins/hooks";
import { sanityCheckCommands, writeCommands } from "./process-replay/write-commands";
import getContainerSize from "./process-replay/get-container-size";

export default async (filepath: string) => {
  gameStore().disposeGame();

  log.info(`@load-replay/file: ${filepath}`);

  processStore().start(Process.ReplayInitialization);

  const janitor = new Janitor();
  const settings = settingsStore().data;

  // validate before showing any loading progress
  let repBin: Buffer;
  let replay: Replay;

  try {
    repBin = await openFile(filepath);
    replay = await parseReplay(repBin);
  } catch (e) {
    screenStore().setError(e instanceof Error ? e : new Error("Invalid replay"));
    return;
  }

  processStore().increment(Process.ReplayInitialization);
  document.title = "Titan Reactor - Loading";

  screenStore().init(ScreenType.Replay);

  const sanityCheck = settings.util.sanityCheckReplayCommands ? sanityCheckCommands(replay, true) : [];

  if (replay.header.players.some(player => player.isComputer)) {
    screenStore().setError(new Error("Replay contains computer players. Computer players are not currently supported."));
    return;
  }

  if (replay.version !== Version.titanReactor) {
    try {
      const chkDowngrader = new ChkDowngrader();
      const chk = chkDowngrader.downgrade(replay.chk.slice(0));
      const rawCmds = sanityCheck.length ? writeCommands(replay, []) : replay.rawCmds;
      //TODO: replace this with reading scr section
      const containerSize = getContainerSize(replay);
      if (containerSize === undefined) {
        throw new Error("invalid container size");
      }
      repBin = await writeReplay(replay.rawHeader, rawCmds, chk, containerSize);
      if (rendererIsDev) {
        fs.writeFileSync(`D:\\last_replay.rep`, repBin);
      }
      replay = await parseReplay(repBin);
    } catch (e) {
      screenStore().setError(e instanceof Error ? e : new Error("Failed to downgrade"));
      return;
    }
  }

  replay.header.players = replay.header.players.filter(p => p.isActive);

  processStore().increment(Process.ReplayInitialization);
  UnitsBufferView.unit_generation_size = replay.containerSize === 1700 ? 5 : 3;

  let map: Chk;
  try {
    map = new Chk(replay.chk);
  } catch (e) {
    screenStore().setError(e instanceof Error ? e : new Error("Invalid chk"));
    return;
  }
  cleanMapTitles(map);

  useWorldStore.setState({ replay, map }, true);
  janitor.callback(() => useWorldStore.setState({}, true));

  processStore().increment(Process.ReplayInitialization);

  const terrain = await loadTerrain(
    map,
    pxToMapMeter(map.size[0], map.size[1])
  );
  const scene = new Scene(terrain);
  janitor.object3d(scene);
  janitor.disposable(scene);

  await waitForAssets();

  await callHookAsync(HOOK_ON_SCENE_PREPARED, scene, scene.userData, map, replay.header);

  processStore().increment(Process.ReplayInitialization);

  assert(openBw.wasm);
  const gameStateReader = new OpenBwWasmReader(openBw);
  janitor.disposable(gameStateReader);

  try {
    gameStateReader.loadReplay(repBin);
  } catch (e: unknown) {
    log.error(e);
  }

  processStore().increment(Process.ReplayInitialization);
  const races = ["terran", "zerg", "protoss"];

  const assets = gameStore().assets;
  if (!assets || !assets.bwDat) {
    throw new Error("assets not loaded");
  }
  processStore().increment(Process.ReplayInitialization);

  const loadAudioFile = async (id: number) => {
    return (await readCascFile(`sound/${assets.bwDat.sounds[id].file}`)).buffer;
  }

  const audioMixer = new MainMixer();
  const soundChannels = new SoundChannels(
    audioMixer,
    loadAudioFile
  );
  const music = new Music(races);
  music.setListener(audioMixer);
  janitor.disposable(music);

  audioMixer.musicVolume = settings.audio.music;
  audioMixer.soundVolume = settings.audio.sound;
  audioMixer.masterVolume = settings.audio.global;

  processStore().increment(Process.ReplayInitialization);
  ImageHD.useDepth = false;

  const disposeGame = await TitanReactorGame(
    map,
    terrain,
    scene,
    assets,
    janitor,
    replay,
    audioMixer,
    soundChannels,
    music,
    gameStateReader,
    new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer),
  );

  gameStore().setDisposeGame(disposeGame);
  processStore().increment(Process.ReplayInitialization);

  document.title = `Titan Reactor - ${map.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`;

  processStore().complete(Process.ReplayInitialization);
  screenStore().complete();
};
