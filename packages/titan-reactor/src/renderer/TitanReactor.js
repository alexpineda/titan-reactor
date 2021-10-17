import createScmExtractor from "scm-extractor";
import fs from "fs";
import path from "path";
import { pick, uniq } from "ramda";
import concat from "concat-stream";
import Chk from "../../libs/bw-chk";
import TitanReactorMap from "./TitanReactorMap";
import TitanReactorGame from "./TitanReactorGame";
import { TitanReactorScene } from "./TitanReactorScene";
import { openFile, log } from "./invoke";
import { parseReplay, convertReplayTo116, Version } from "downgrade-replay";

import createTitanImage from "../common/image/createTitanImage";
import { createIScriptRunner } from "../common/iscript/IScriptRunner";

import FileGameStateReader from "./game/bw/FileGameStateReader";
import Assets from "./Assets";
import TitanSprite from "../common/image/TitanSprite";
import AudioMaster from "./audio/AudioMaster";
import useLoadingStore from "./stores/loadingStore";
import useSettingsStore, { getSettings } from "./stores/settingsStore";
import { setGame, disposeGame, getAssets, setAssets } from "./stores/gameStore";

const loadScx = (filename) =>
  new Promise((res) =>
    fs
      .createReadStream(filename)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(data);
        })
      )
  );

export class TitanReactor {
  constructor() {
    // preload assets once valid settings are available
    const unsub = useSettingsStore.subscribe(({ errors, data: settings }) => {
      if (errors.length) return;

      const assets = new Assets();
      assets.preload(settings.starcraftPath, settings.communityModelsPath);
      setAssets(assets);
      unsub();
    });
  }

  waitForAssets() {
    log("waiting for assets");
    return new Promise((res) => {
      if (useLoadingStore.getState().assetsComplete) {
        res();
        return;
      }
      const unsub = useLoadingStore.subscribe(({ assetsComplete }) => {
        if (assetsComplete) {
          unsub();
          res();
        }
      });
    });
  }

  async spawnReplay(filepath) {
    log(`loading replay ${filepath}`);
    disposeGame();
    document.title = "Titan Reactor - Loading";

    const settings = getSettings();
    const loadingStore = useLoadingStore.getState();
    loadingStore.initRep(filepath);

    log("parsing replay");
    const repBin = await openFile(filepath);
    let repFile = filepath;
    const outFile = path.join(settings.tempPath, "replay.out");

    let rep = await parseReplay(repBin);
    if (rep.version === Version.remastered) {
      const classicRep = await convertReplayTo116(repBin);
      repFile = path.join(settings.tempPath, "replay.rep");
      await new Promise((res) =>
        fs.writeFile(repFile, classicRep, (err) => {
          if (err) {
            log(err, "error");
            return;
          }
          res();
        })
      );

      rep = await parseReplay(classicRep);
    }

    loadingStore.updateRep(pick(["header"], rep));

    log("loading chk");
    const chk = new Chk(rep.chk);
    loadingStore.updateChk(pick(["title", "description"], chk));

    log("initializing scene");
    const scene = new TitanReactorScene(chk);
    await scene.init(settings.isDev);

    log("starting gamestate reader", repFile, outFile);
    const gameStateReader = new FileGameStateReader(
      repFile,
      outFile,
      settings.starcraftPath
    );
    await gameStateReader.start();
    log("waiting for maxed");

    await this.waitForAssets();

    await gameStateReader.waitForMaxed;

    const races = settings.musicAllTypes
      ? ["terran", "zerg", "protoss"]
      : uniq(rep.header.players.map(({ race }) => race));

    const assets = getAssets();

    log("initializing audio");
    const audioMaster = new AudioMaster(
      assets.loadAudioFile,
      settings.audioPanningStyle,
      races
    );
    audioMaster.musicVolume = settings.musicVolume;
    audioMaster.soundVolume = settings.soundVolume;

    log("initializing replay");
    const game = await TitanReactorGame(
      scene,
      chk,
      rep,
      gameStateReader,
      assets.bwDat,
      createTitanImage(
        assets.bwDat,
        assets.grps,
        createIScriptRunner(assets.bwDat, chk.tileset),
        (err) => log(err, "error")
      ),
      audioMaster
    );

    setGame(game);
    loadingStore.completeRep();

    log("starting replay");
    document.title = "Titan Reactor - Observing";
    game.start();
  }

  async spawnMapViewer(chkFilepath) {
    const startTime = Date.now();
    const minDisplayTime = 3000;

    disposeGame();

    const loadingStore = useLoadingStore.getState();
    const settings = getSettings();
    loadingStore.initChk(chkFilepath);

    log("loading chk");
    const chk = new Chk(await loadScx(chkFilepath));
    window.chk = chk;
    loadingStore.updateChk(pick(["title", "description"], chk));

    document.title = `Titan Reactor - ${chk.title}`;

    await this.waitForAssets();
    const assets = getAssets();

    log("initializing scene");
    const scene = new TitanReactorScene(
      chk,
      settings.anisotropy,
      settings.renderMode
    );
    await scene.init();

    const createTitanSprite = () =>
      new TitanSprite(
        null,
        assets.bwDat,
        createTitanSprite,
        createTitanImage(
          assets.bwDat,
          assets.grps,
          createIScriptRunner(assets.bwDat, chk.tileset),
          (err) => log(err, "error")
        ),
        (sprite) => scene.add(sprite)
      );

    const game = await TitanReactorMap(
      assets.bwDat,
      chk,
      scene,
      createTitanSprite
    );

    await new Promise((res) =>
      setTimeout(res, Math.max(0, minDisplayTime - (Date.now() - startTime)))
    );

    setGame(game);
    loadingStore.completeChk();
  }

  dispose() {
    disposeGame();
  }
}
