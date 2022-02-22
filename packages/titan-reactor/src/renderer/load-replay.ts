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
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import Janitor from "./utils/janitor";
import { openBw } from "./openbw";
import UnitsBufferView from "./buffer-view/units-buffer-view";

export default async (filepath: string) => {
  log.info(`@load-replay/file: ${filepath}`);

  processStore().init({
    id: Process.ReplayInitialization,
    label: getFunString(),
    priority: 1,
  });

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

  document.title = "Titan Reactor - Loading";

  screenStore().init(ScreenType.Replay);

  if (replay.version !== Version.titanReactor) {
    try {
      const chkDowngrader = new ChkDowngrader();
      repBin = await convertReplay(replay, chkDowngrader);
      fs.writeFileSync(`D:\\last_replay.rep`, repBin);
      replay = await parseReplay(repBin);
    } catch (e) {
      screenStore().setError(e instanceof Error ? e : new Error("Failed to downgrade"));
      return;
    }
  }

  UnitsBufferView.unit_generation_size = replay.containerSize === 1700 ? 5 : 3;

  let chk: Chk;
  try {
    chk = new Chk(replay.chk);
  } catch (e) {
    screenStore().setError(e instanceof Error ? e : new Error("Invalid chk"));
    return;
  }

  screenStore().updateLoadingInformation({ header: replay.header, chkTitle: chk.title });

  const terrain = await loadTerrain(
    chk,
    pxToMapMeter(chk.size[0], chk.size[1])
  );
  const scene = new Scene(terrain);
  janitor.object3d(scene);
  janitor.disposable(scene);

  await waitForAssets();

  processStore().updateIndeterminate(Process.ReplayInitialization, "Connecting to the hivemind");

  assert(openBw.wasm);
  const gameStateReader = new OpenBwWasmReader(openBw);
  janitor.disposable(gameStateReader);

  try {
    gameStateReader.loadReplay(repBin);
  } catch (e: unknown) {
    log.error(e);
  }

  const races = ["terran", "zerg", "protoss"];

  const assets = gameStore().assets;
  if (!assets || !assets.bwDat) {
    throw new Error("assets not loaded");
  }

  const audioMixer = new MainMixer();
  const soundChannels = new SoundChannels(
    audioMixer,
    assets.loadAudioFile.bind(assets)
  );
  const music = new Music(races);
  //@todo refactor music outside of three Audio
  //@ts-ignore
  music.setListener(audioMixer as unknown as AudioListener);
  janitor.disposable(music);

  audioMixer.musicVolume = settings.audio.music;
  audioMixer.soundVolume = settings.audio.sound;
  audioMixer.masterVolume = settings.audio.global;

  processStore().updateIndeterminate(Process.ReplayInitialization, getFunString());
  ImageHD.useDepth = false;

  const world = {
    scene,
    terrain,
    chk,
    replay,
    commandsStream: new CommandsStream(replay.rawCmds),
    gameStateReader,
    assets,
    audioMixer,
    music,
    soundChannels,
    janitor,
  };
  log.verbose("initializing game interface");
  const disposeGame = await TitanReactorGame(world);
  gameStore().setDisposeGame(disposeGame);

  log.verbose("starting replay");
  document.title = `Titan Reactor - ${chk.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`;

  processStore().complete(Process.ReplayInitialization);
  screenStore().complete();
};
