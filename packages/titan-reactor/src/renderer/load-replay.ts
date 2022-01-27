import {
  convertReplay,
  parseReplay,
  Version,
  CommandsStream,
  ChkDowngrader,
} from "downgrade-replay";
import fs from "fs";

import Chk from "bw-chk";
import { ImageHD } from "./core";
import { MainMixer, SoundChannels, Music } from "./audio";
import OpenBwWasmReader from "./openbw/openbw-reader";
import { openFile } from "./ipc";
import * as log from "./ipc/log";
import { Scene } from "./render";
import loadTerrain from "./assets/load-terrain";
import {
  disposeGame,
  getAssets,
  getSettings,
  setGame,
  startLoadingProcess,
  updateIndeterminateLoadingProcess,
  completeLoadingProcess,
  initScreen,
  updateScreen,
  completeScreen,
  ReplayScreen,
} from "./stores";
import TitanReactorGame from "./view-replay";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import Janitor from "./utils/janitor";
import { openBw } from "./openbw";
import { strict as assert } from "assert";
import { pxToMapMeter } from "../common/utils/conversions";
import { setWorld } from "./world";

export default async (filepath: string) => {
  log.info(`loading replay ${filepath}`);

  startLoadingProcess({
    id: "replay",
    label: getFunString(),
    priority: 1,
  });

  disposeGame();

  const janitor = new Janitor();
  const settings = getSettings();

  // validate before showing any loading progress
  let repBin = await openFile(filepath);
  let replay = await parseReplay(repBin);

  document.title = "Titan Reactor - Loading";

  initScreen({
    type: "replay",
    filename: filepath,
  } as ReplayScreen);

  log.verbose("parsing replay");

  // @todo change this to generics
  // @ts-ignore
  updateScreen({ header: replay.header } as ReplayScreen);

  if (replay.version !== Version.titanReactor) {
    log.verbose(
      `changing replay format`
    );
    const chkDowngrader = new ChkDowngrader();
    repBin = await convertReplay(replay, chkDowngrader);
    // fs.writeFileSync(`D:\\last_replay.rep`, repBin);
    replay = await parseReplay(repBin);
  }

  log.verbose("loading chk");
  const chk = new Chk(replay.chk);
  updateScreen({ chkTitle: chk.title } as ReplayScreen);

  log.verbose("building terrain");
  const terrain = await loadTerrain(
    chk,
    pxToMapMeter(chk.size[0], chk.size[1])
  );
  const scene = new Scene(terrain);
  janitor.object3d(scene);

  await waitForAssets();

  updateIndeterminateLoadingProcess("replay", "Connecting to the hivemind");

  assert(openBw.wasm);
  const gameStateReader = new OpenBwWasmReader(openBw.wasm);
  janitor.disposable(gameStateReader);

  try {
    gameStateReader.loadReplay(repBin);
  } catch (e: unknown) {
    log.error(e);
  }

  const races = ["terran", "zerg", "protoss"];

  const assets = getAssets();
  if (!assets || !assets.bwDat) {
    throw new Error("assets not loaded");
  }

  log.verbose("initializing audio");

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

  log.verbose("starting gameloop");
  updateIndeterminateLoadingProcess("replay", getFunString());
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
  const game = await TitanReactorGame(world);

  setGame(game);
  completeScreen();

  log.verbose("starting replay");
  document.title = `Titan Reactor - ${chk.title} - ${replay.header.players
    .map(({ name }) => name)
    .join(", ")}`;
  game.start();

  const logDiv = document.getElementById("log");
  if (logDiv) {
    logDiv.remove();
  }
  completeLoadingProcess("replay");
};
