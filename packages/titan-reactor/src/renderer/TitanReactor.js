import { remote } from "electron";
import createScmExtractor from "scm-extractor";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { pick, uniq } from "ramda";
import concat from "concat-stream";
import Chk from "../../libs/bw-chk";
import TitanReactorMap from "./TitanReactorMap";
import TitanReactorGame from "./TitanReactorGame";
import { WebGLRenderer } from "three";
import { TitanReactorScene } from "./TitanReactorScene";
import { RenderMode } from "common/settings";
import { openFile, log } from "./invoke";
import { loadAllDataFiles } from "titan-reactor-shared/dat/loadAllDataFiles";
import { UnitDAT } from "titan-reactor-shared/dat/UnitsDAT";
import { parseReplay, convertReplayTo116, Version } from "downgrade-replay";
import loadEnvironmentMap from "titan-reactor-shared/image/envMap";
import GrpSD from "titan-reactor-shared/image/GrpSD";
import GrpSD2 from "titan-reactor-shared/image/GrpSD2";
import GrpHD from "titan-reactor-shared/image/GrpHD";
import Grp3D from "titan-reactor-shared/image/Grp3D";
import createTitanImage from "titan-reactor-shared/image/createTitanImage";
import { createIScriptRunner } from "titan-reactor-shared/iscript/IScriptRunner";
import electronFileLoader from "./utils/electronFileLoader";

import readBwFile, {
  closeStorage,
  openStorage,
} from "titan-reactor-shared/utils/readBwFile";
import FileGameStateReader from "./game/bw/FileGameStateReader";
import AtlasPreloader from "titan-reactor-shared/image/AtlasPreloader";
import ImagesBW from "./game/bw/ImagesBW";
import {
  calculateImagesFromSpritesIscript,
  calculateImagesFromUnitsIscript,
} from "titan-reactor-shared/image/calculateImagesFromIScript";
import TitanSprite from "titan-reactor-shared/image/TitanSprite";
import AudioMaster from "./audio/AudioMaster";
import useLoadingStore from "./stores/loadingStore";
import useSettingsStore from "./stores/settingsStore";
import useGameStore from "./stores/gameStore";
import ContiguousContainer from "./game/bw/ContiguousContainer";

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
    this.game = null;
  }

  async preload() {
    if (useLoadingStore.getState().preloaded) return;

    const settings = useSettingsStore.getState().data;

    //@todo move parsing to renderer so I don't have to reassign shit
    log("loading DAT and ISCRIPT files");
    openStorage(settings.starcraftPath);

    const origBwDat = await loadAllDataFiles(readBwFile);
    this.bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat;
    ContiguousContainer.prototype.bwDat = this.bwDat;

    const renderer = new WebGLRenderer();
    // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    renderer.dispose();

    useLoadingStore.setState({ preloaded: true });
  }

  initElectronFileReader() {
    electronFileLoader((file) => {
      if (file.includes(".glb") || file.includes(".hdr")) {
        return fsPromises.readFile(file);
      } else {
        return readBwFile(file);
      }
    });
  }
  async spawnReplay(filepath) {
    // const dispatchRepLoadingProgress = () =>
    //   this.store.dispatch(loadingProgress("replay"));

    this.initElectronFileReader();

    this.filename = filepath;

    log(`loading replay ${filepath}`);
    log("disposing previous replay resources");
    this.game && this.game.dispose();

    const settings = useSettingsStore.getState().data;
    const loadingStore = useLoadingStore.getState();
    loadingStore.initRep(filepath);

    log("parsing replay");
    const repBin = await openFile(filepath);
    let repFile = filepath;
    const outFile = path.join(remote.app.getPath("temp"), "replay.out");
    this.rep = await parseReplay(repBin);
    if (this.rep.version === Version.remastered) {
      const classicRep = await convertReplayTo116(repBin);
      repFile = path.join(remote.app.getPath("temp"), "replay.rep");
      await new Promise((res) =>
        fs.writeFile(repFile, classicRep, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          res();
        })
      );

      this.rep = await parseReplay(classicRep);
    }

    loadingStore.updateRep(pick(["header"], this.rep));

    // this.rep = await parseReplay(await openFile(filepath));

    log("loading chk");
    this.chk = new Chk(this.rep.chk);
    loadingStore.updateChk(pick(["title", "description"], this.chk));
    log("showing loading overlay");

    await this.preload();

    document.title = "Titan Reactor - Observing";

    this.atlases = {};

    const atlasPreloader = new AtlasPreloader(
      this.bwDat,
      settings.communityModelsPath,
      readBwFile,
      this.chk.tileset,
      () => {
        if (settings.renderMode === RenderMode.SD) {
          return new GrpSD2();
        } else if (settings.renderMode === RenderMode.HD) {
          return new GrpHD();
        } else if (settings.renderMode === RenderMode.ThreeD) {
          return new Grp3D(this.envMap);
        } else {
          throw new Error("invalid render mode");
        }
      },
      this.atlases
    );

    await atlasPreloader.init();

    const imagesBW = new ImagesBW();

    const preloadAtlas = async (frames) => {
      for (let frame of frames) {
        imagesBW.buffer = frame.images;
        imagesBW.count = frame.imageCount;

        for (let image of imagesBW.items()) {
          await atlasPreloader.load(image.id);
        }
      }
    };

    let start = Date.now();
    const gameStateReader = new FileGameStateReader(
      repFile,
      outFile,
      settings.starcraftPath
    );
    await gameStateReader.start();
    await gameStateReader.waitForMaxed;

    console.log(`initial replay frames loaded in ${Date.now() - start}`);

    start = Date.now();
    await preloadAtlas(gameStateReader.frames.items);
    console.log(`images preloaded in ${Date.now() - start}`);

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      settings.anisotropy,
      settings.renderMode
    );
    await scene.init(settings.isDev);

    const races = settings.musicAllTypes
      ? ["terran", "zerg", "protoss"]
      : uniq(this.rep.header.players.map(({ race }) => race));

    const audioMaster = new AudioMaster(
      (id) => readBwFile(`sound/${this.bwDat.sounds[id].file}`),
      settings.audioPanningStyle,
      races
    );
    audioMaster.musicVolume = settings.musicVolume;
    audioMaster.soundVolume = settings.soundVolume;

    log("initializing replay");
    this.game = await TitanReactorGame(
      scene,
      this.chk,
      this.rep,
      gameStateReader,
      this.bwDat,
      createTitanImage(
        this.bwDat,
        this.atlases,
        createIScriptRunner(this.bwDat, this.chk.tileset),
        (err) => console.error(err)
      ),
      preloadAtlas,
      audioMaster
    );

    useGameStore.setState({ game: this.game });
    loadingStore.completeRep();

    this.game.start();
  }

  async spawnMapViewer(chkFilepath) {
    const startTime = Date.now();
    const minDisplayTime = 3000;

    this.initElectronFileReader();

    this.chk = null;
    this.chkPreviewCanvas = null;
    this.filename = chkFilepath;

    const loadingStore = useLoadingStore.getState();
    const settings = useSettingsStore.getState().data;
    loadingStore.initChk(chkFilepath);

    this.game && this.game.dispose();

    log("loading chk");

    this.chk = new Chk(await loadScx(chkFilepath));
    window.chk = this.chk;
    loadingStore.updateChk(pick(["title", "description"], this.chk));

    document.title = `Titan Reactor - ${this.chk.title}`;

    this.atlases = {};

    const atlasPreloader = new AtlasPreloader(
      this.bwDat,
      settings.communityModelsPath,
      readBwFile,
      this.chk.tileset,
      () => {
        if (settings.renderMode === RenderMode.SD) {
          return new GrpSD();
        } else if (settings.renderMode === RenderMode.HD) {
          return new GrpHD();
        } else if (settings.renderMode === RenderMode.ThreeD) {
          return new Grp3D(this.envMap);
        } else {
          throw new Error("invalid render mode");
        }
      },
      this.atlases
    );

    const imageIds = [
      ...calculateImagesFromUnitsIscript(
        this.bwDat,
        this.chk.units.map(({ unitId }) => unitId)
      ),
      ...calculateImagesFromSpritesIscript(
        this.bwDat,
        this.chk.sprites.map(({ spriteId }) => spriteId)
      ),
    ];

    await atlasPreloader.init();

    for (let imageId of imageIds) {
      await atlasPreloader.load(imageId);
    }

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      settings.anisotropy,
      settings.renderMode
    );
    await scene.init();

    const createTitanSprite = () =>
      new TitanSprite(
        null,
        this.bwDat,
        createTitanSprite,
        createTitanImage(
          this.bwDat,
          this.atlases,
          createIScriptRunner(this.bwDat, this.chk.tileset),
          (err) => console.error(err)
        ),
        (sprite) => scene.add(sprite)
      );

    this.game = await TitanReactorMap(
      this.bwDat,
      this.chk,
      scene,
      createTitanSprite
    );

    await new Promise((res) =>
      setTimeout(res, Math.max(0, minDisplayTime - (Date.now() - startTime)))
    );

    useGameStore.setState({ game: this.game });
    loadingStore.completeChk();
  }

  dispose() {
    closeStorage();
  }
}
