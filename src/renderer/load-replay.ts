import {
  convertReplay,
  parseReplay,
  Version,
  CommandsStream,
  ChkDowngrader,
  Replay,
} from "downgrade-replay";
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
import loadTerrain from "./assets/load-terrain";
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

export default async (filepath: string) => {
  log.info(`@load-replay/file: ${filepath}`);

  processStore().start(Process.ReplayInitialization);

  gameStore().disposeGame();

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

  processStore().increment(Process.ReplayInitialization, 8);
  document.title = "Titan Reactor - Loading";

  screenStore().init(ScreenType.Replay);

  if (replay.version !== Version.titanReactor) {
    try {
      const chkDowngrader = new ChkDowngrader();
      repBin = await convertReplay(replay, chkDowngrader);
      if (rendererIsDev) {
        fs.writeFileSync(`D:\\last_replay.rep`, repBin);
      }
      replay = await parseReplay(repBin);
    } catch (e) {
      screenStore().setError(e instanceof Error ? e : new Error("Failed to downgrade"));
      return;
    }
  }

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

  const world = {
    scene,
    terrain,
    map,
    replay,
    commandsStream: new CommandsStream(replay.rawCmds),
    gameStateReader,
    assets,
    audioMixer,
    music,
    soundChannels,
    janitor,
  };
  const disposeGame = await TitanReactorGame(world);
  gameStore().setDisposeGame(disposeGame);
  processStore().increment(Process.ReplayInitialization);

  document.title = `Titan Reactor - ${map.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`;

  processStore().complete(Process.ReplayInitialization);
  screenStore().complete();
};