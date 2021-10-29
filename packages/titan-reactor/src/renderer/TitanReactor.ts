import concat from "concat-stream";
import {
  downgradeReplay,
  parseReplay,
  Version,
  CommandsStream,
  validateDowngrade,
} from "downgrade-replay";
import { ChkDowngrader } from "downgrade-chk";
import fs from "fs";
import path from "path";
import createScmExtractor from "scm-extractor";
import { Object3D } from "three";

import Chk from "../../libs/bw-chk";
import {
  createTitanImageFactory,
  TitanImageHD,
  TitanSprite,
} from "../common/image";
import { createIScriptRunnerFactory } from "../common/iscript";
import { ChkType, EmptyFunc } from "../common/types";
import pick from "../common/utils/pick";
import uniq from "../common/utils/uniq";
import Assets from "./Assets";
import { AudioMaster } from "./audio";
import OpenBwBridgeReader from "./game-data/readers/OpenBwBridgeReader";
import { log, openFile } from "./ipc";
import Scene, { generateTerrain } from "./render/Scene";
import {
  disposeAssets,
  disposeGame,
  getAssets,
  getSettings,
  setAssets,
  setGame,
  startLoadingProcess,
  updateIndeterminateLoadingProcess,
  completeLoadingProcess,
  isLoadingProcessComplete,
} from "./stores";
import useLoadingStore from "./stores/loadingStore";
import useSettingsStore from "./stores/settingsStore";
import TitanReactorGame from "./TitanReactorGame";
import TitanReactorMap from "./TitanReactorMap";

const loadScx = (filename: string) =>
  new Promise((res) =>
    fs
      .createReadStream(filename)
      .pipe(createScmExtractor())
      .pipe(
        concat((data: Buffer) => {
          res(data);
        })
      )
  );

const funStrings = [
  "It's a zergling Lester.",
  "Drop your socks and grab your throttle.",
  "We shall win through, no matter the cost.",
  "I got your Zerg right here. hehehehe.",
  "Taking us into orbit.",
  "Do you seek knowledge of time travel?",
  "I see you have an appetite for destruction.",
  "I like your style, friend.",
  "Shields up, weapons online.",
  "You know who the best star fighter in the fleet is?",
];
const getFunString = () =>
  funStrings[Math.floor(Math.random() * funStrings.length)];

export class TitanReactor {
  constructor() {
    // preload assets once valid settings are available
    useSettingsStore.subscribe(
      ({ errors, data: settings }, { data: prevSettings }) => {
        if (errors.length || !settings) {
          return;
        }

        // only load assets if we haven't loaded once yet or if the community models path has changed
        if (
          settings.communityModelsPath === prevSettings?.communityModelsPath &&
          getAssets()
        ) {
          return;
        }
        const assets = new Assets();
        setAssets(null);
        assets.preload(settings.starcraftPath, settings.communityModelsPath);
        setAssets(assets);
      }
    );
  }

  waitForAssets() {
    log("waiting for assets");
    return new Promise((res: EmptyFunc) => {
      if (isLoadingProcessComplete("assets")) {
        res();
        return;
      }
      const unsub = useLoadingStore.subscribe(() => {
        if (isLoadingProcessComplete("assets")) {
          unsub();
          res();
        }
      });
    });
  }

  async spawnReplay(filepath: string) {
    log(`loading replay ${filepath}`);
    disposeGame();

    const settings = getSettings();
    if (!settings) {
      throw new Error("settings not loaded");
    }
    // validate before showing any loading progress
    const repBin = await openFile(filepath);
    let rep = await parseReplay(repBin);
    if (rep.version === Version.remastered) {
      if (!validateDowngrade(rep)) {
        alert("This replay file has too many units for downgrading to 1.16 :(");
        return;
      }
    }

    document.title = "Titan Reactor - Loading";
    startLoadingProcess({
      id: "replay",
      label: getFunString(),
      priority: 1,
    });
    const loadingStore = useLoadingStore.getState();
    loadingStore.initRep(filepath);

    log("parsing replay");
    let repFile = filepath;
    const outFile = path.join(settings.tempPath, "replay.out");

    loadingStore.updateRep(pick(["header"], rep));

    if (rep.version === Version.remastered) {
      const chkDowngrader = new ChkDowngrader();
      const classicRep = await downgradeReplay(rep, chkDowngrader);
      repFile = path.join(settings.tempPath, "replay.rep");
      //@todo use fsPromises, bail on error
      await new Promise((res: EmptyFunc) =>
        fs.writeFile(repFile, classicRep, (err) => {
          if (err) {
            log(err.message, "error");
            return;
          }
          res();
        })
      );
      rep = await parseReplay(classicRep);
    }

    log("loading chk");
    const chk = new Chk(rep.chk);
    loadingStore.updateChk(pick(["title", "description"], chk));

    log("building terrain");
    const terrainInfo = await generateTerrain(chk);
    const scene = new Scene(terrainInfo);

    await this.waitForAssets();

    updateIndeterminateLoadingProcess("replay", "Connecting to the hivemind");

    log(`starting gamestate reader ${repFile} ${outFile}`);
    const gameStateReader = new OpenBwBridgeReader(
      settings.starcraftPath,
      repFile,
      outFile
    );
    await gameStateReader.start();
    log("waiting for maxed");

    await gameStateReader.waitForMaxed;

    const races = settings.musicAllTypes
      ? ["terran", "zerg", "protoss"]
      : uniq(rep.header.players.map(({ race }: { race: string }) => race));

    const assets = getAssets();
    if (!assets || !assets.bwDat) {
      throw new Error("assets not loaded");
    }
    log("initializing audio");
    const audioMaster = new AudioMaster(
      assets.loadAudioFile.bind(assets),
      races
    );
    audioMaster.musicVolume = settings.musicVolume;
    audioMaster.soundVolume = settings.soundVolume;

    log("initializing replay");
    updateIndeterminateLoadingProcess("replay", getFunString());
    TitanImageHD.useDepth = false;
    const game = await TitanReactorGame(
      scene,
      terrainInfo,
      chk.units,
      rep,
      new CommandsStream(rep.rawCmds),
      gameStateReader,
      assets.bwDat,
      createTitanImageFactory(
        assets.bwDat,
        assets.grps,
        createIScriptRunnerFactory(assets.bwDat, chk.tileset),
        (err) => log(err, "error")
      ),
      audioMaster
    );

    setGame(game);
    loadingStore.completeRep();

    log("starting replay");
    document.title = "Titan Reactor - Observing";
    game.start();
    completeLoadingProcess("replay");
  }

  async spawnMapViewer(chkFilepath: string) {
    const startTime = Date.now();
    const minDisplayTime = 3000;

    disposeGame();

    startLoadingProcess({
      id: "map",
      label: getFunString(),
      priority: 1,
    });

    const loadingStore = useLoadingStore.getState();
    loadingStore.initChk(chkFilepath);

    log("loading chk");
    const chk = new Chk(await loadScx(chkFilepath)) as ChkType;
    loadingStore.updateChk(pick(["title", "description"], chk));

    document.title = `Titan Reactor - ${chk.title}`;

    await this.waitForAssets();
    const assets = getAssets();
    if (!assets || !assets.bwDat) {
      throw new Error("assets not loaded");
    }

    log("initializing scene");
    updateIndeterminateLoadingProcess("map", getFunString());

    const terrainInfo = await generateTerrain(chk);
    const scene = new Scene(terrainInfo);

    const createTitanSprite = () =>
      new TitanSprite(
        null,
        assets.bwDat,
        createTitanSprite,
        createTitanImageFactory(
          assets.bwDat,
          assets.grps,
          createIScriptRunnerFactory(assets.bwDat, chk.tileset),
          (err) => log(err, "error")
        ),
        (sprite: Object3D) => scene.add(sprite)
      );

    TitanImageHD.useDepth = true;
    updateIndeterminateLoadingProcess("map", getFunString());

    const game = await TitanReactorMap(
      assets.bwDat,
      chk.units,
      chk.sprites,
      terrainInfo,
      scene,
      createTitanSprite
    );

    await new Promise((res) =>
      setTimeout(res, Math.max(0, minDisplayTime - (Date.now() - startTime)))
    );

    completeLoadingProcess("map");
    setGame(game);
    loadingStore.completeChk();
  }

  dispose() {
    disposeGame();
    disposeAssets();
  }
}
