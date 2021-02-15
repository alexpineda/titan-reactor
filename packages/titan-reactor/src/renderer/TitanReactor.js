import { ipcRenderer } from "electron";
import createScmExtractor from "scm-extractor";
import fs from "fs";
import concat from "concat-stream";
import { uniq } from "ramda";
import Chk from "../../libs/bw-chk";
import TitanReactorMap from "./TitanReactorMap";
import TitanReactorReplay from "./TitanReactorReplay";
import { WebGLRenderer } from "three";
import { TitanReactorScene } from "./TitanReactorScene";
import { RenderMode } from "common/settings";
import BgMusic from "./audio/BgMusic";
import {
  openFile,
  log,
  loadReplayFromFile,
  updateCurrentReplayPosition,
} from "./invoke";
import { loadAllDataFiles } from "titan-reactor-shared/dat/loadAllDataFiles";
import preloadImageAtlases from "titan-reactor-shared/image/preloadImageAtlases";
import { UnitDAT } from "titan-reactor-shared/dat/UnitsDAT";
import { parseReplay } from "downgrade-replay";
import { loading, loadingProgress } from "./titanReactorReducer";
import loadEnvironmentMap from "titan-reactor-shared/image/envMap";
import GrpSD from "titan-reactor-shared/image/GrpSD";
import GrpHD from "titan-reactor-shared/image/GrpHD";
import Grp3D from "titan-reactor-shared/image/Grp3D";
import createTitanImage from "titan-reactor-shared/image/createTitanImage";
import { createIScriptRunner } from "titan-reactor-shared/iscript/IScriptRunner";

import readBwFile, {
  closeStorage,
  openStorage,
} from "titan-reactor-shared/utils/readBwFile";
import { calculateImagesFromUnitsIscript } from "titan-reactor-shared/image/calculateImagesFromIScript";

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
  constructor(store) {
    this.store = store;
    this.scene = null;
  }

  async preload() {
    const state = this.store.getState();
    if (
      state.titan.processes.preload.completed ||
      state.titan.processes.preload.started
    )
      return;

    const dispatchPreloadLoadingProgress = () =>
      this.store.dispatch(loadingProgress("preload"));
    this.store.dispatch(loading("preload", 1));

    //@todo move parsing to renderer so I don't have to reassign shit
    log("loading DAT and ISCRIPT files");
    openStorage(state.settings.data.starcraftPath);
    const origBwDat = await loadAllDataFiles(readBwFile);
    this.bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat;

    const renderer = new WebGLRenderer();
    // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    renderer.dispose();

    dispatchPreloadLoadingProgress();
  }

  async spawnReplay(filepath) {
    const state = this.store.getState();
    const dispatchRepLoadingProgress = () =>
      this.store.dispatch(loadingProgress("replay"));

    if (!state.titan.processes.preload.completed) {
      throw new Error("cannot spawn replay before preloading assets");
    }

    this.filename = filepath;

    this.store.dispatch(loading("replay", 4));

    log(`loading replay ${filepath}`);
    log("disposing previous replay resources");
    this.scene && this.scene.dispose();

    log("parsing replay");
    this.rep = await parseReplay(await openFile(filepath));
    dispatchRepLoadingProgress();

    log("loading chk");
    this.store.dispatch(loading("chk"));
    this.chk = new Chk(this.rep.chk);
    this.store.dispatch(loadingProgress("chk"));

    log("showing loading overlay");

    await this.preload();

    document.title = "Titan Reactor - Replay";

    await loadReplayFromFile(filepath);

    this.atlases = {};

    const preloadAtlas = async (frames) => {
      const preloadImages = uniq(
        frames.flatMap((frame) => {
          return frame.sprites.flatMap((sprites) => {
            return sprites.images.map((image) => {
              return image.id;
            });
          });
        })
      );

      await preloadImageAtlases(
        this.bwDat,
        state.settings.data.communityModelsPath,
        readBwFile,
        this.chk.tileset,
        preloadImages,
        () => {
          if (state.settings.data.renderMode === RenderMode.SD) {
            return new GrpSD();
          } else if (state.settings.data.renderMode === RenderMode.HD) {
            return new GrpHD();
          } else if (state.settings.data.renderMode === RenderMode.ThreeD) {
            return new Grp3D(this.envMap);
          } else {
            throw new Error("invalid render mode");
          }
        },
        this.atlases
      );
    };

    const availableFrames = [];

    await new Promise((res) => {
      const _newFramesListener = (evt, frames) => {
        availableFrames.push(...frames);
      };

      const _pausedFramesListener = () => {
        res();

        ipcRenderer.off("new-frames", _newFramesListener);
        ipcRenderer.off("paused-frames", _pausedFramesListener);
      };

      ipcRenderer.on("new-frames", _newFramesListener);
      ipcRenderer.on("paused-frames", _pausedFramesListener);
    });

    await preloadAtlas(availableFrames);

    dispatchRepLoadingProgress();

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      state.settings.data.anisotropy,
      state.settings.data.renderMode
    );
    await scene.init(state.settings.isDev);
    dispatchRepLoadingProgress();

    log("initializing replay");
    this.scene = await TitanReactorReplay(
      this.store,
      scene,
      this.chk,
      this.rep,
      availableFrames,
      this.bwDat,
      new BgMusic(state.settings.data.starcraftPath),
      this.atlases,
      createTitanImage(
        this.bwDat,
        this.atlases,
        createIScriptRunner(this.bwDat, this.chk.tileset),
        (err) => console.error(err)
      ),
      preloadAtlas
    );
    dispatchRepLoadingProgress();
  }

  async spawnMapViewer(chkFilepath) {
    const state = this.store.getState();
    const dispatchMapLoadingProgress = () =>
      this.store.dispatch(loadingProgress("map"));

    if (!state.titan.processes.preload.completed) {
      throw new Error("cannot spawn replay before preloading assets");
    }

    this.chk = null;
    this.chkPreviewCanvas = null;
    this.filename = chkFilepath;

    this.store.dispatch(loading("map", 3));

    this.scene && this.scene.dispose();

    log("loading chk");

    this.chk = new Chk(await loadScx(chkFilepath));
    window.chk = this.chk;

    dispatchMapLoadingProgress();

    document.title = `Titan Reactor - ${this.chk.title}`;

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      state.settings.data.anisotropy,
      state.settings.data.renderMode
    );
    await scene.init();

    dispatchMapLoadingProgress();

    this.scene = await TitanReactorMap(this.store, this.chk, scene);
    dispatchMapLoadingProgress();
  }

  dispose() {
    closeStorage();
  }
}
