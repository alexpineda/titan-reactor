import createScmExtractor from "scm-extractor";
import fs from "fs";
import concat from "concat-stream";
import Chk from "../../libs/bw-chk";
import { ImageSD } from "./mesh/ImageSD";
import { Image3D } from "./mesh/Image3D";
import EmptyImage from "./mesh/EmptyImage";
import TitanReactorMap from "./TitanReactorMap";
import TitanReactorReplay from "./TitanReactorReplay";
import { DefaultLoadingManager, LoadingManager } from "three";
import { TitanReactorScene } from "./TitanReactorScene";
import { RenderMode } from "common/settings";
import BgMusic from "./audio/BgMusic";
import { openFile, log } from "./invoke";
import { loadAllDataFiles } from "titan-reactor-shared/dat/loadAllDataFiles";
import { UnitDAT } from "titan-reactor-shared/dat/UnitsDAT";
import { parseReplay } from "downgrade-replay";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import {
  loading,
  loadingProgress,
  loadingError,
  criticalErrorOccurred,
} from "./titanReactorReducer";

import readBwFile, {
  closeStorage,
  openStorage,
} from "titan-reactor-shared/utils/readBwFile";

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
    const origBwDat = await loadAllDataFiles(
      state.settings.data.starcraftPath,
      readBwFile
    );
    this.bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat;
    await readBwFile(`tileset/jungle.cv5`);
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
    // const rep = await loadReplayFromFile(filepath);
    dispatchRepLoadingProgress();

    log("loading chk");
    this.store.dispatch(loading("chk"));
    this.chk = new Chk(this.rep.chk);
    this.store.dispatch(loadingProgress("chk"));

    log("showing loading overlay");

    await this.preload();

    const loadingManager = new LoadingManager();

    document.title = "Titan Reactor - Replay";

    let renderImage;
    if (state.settings.isDev) {
      renderImage = new EmptyImage();
    } else if (
      state.settings.data.renderMode === RenderMode.SD ||
      state.settings.data.renderMode === RenderMode.HD
    ) {
      renderImage = new ImageSD(
        this.bwDat,
        state.settings.data.starcraftPath,
        this.loadSprite
      );
    } else {
      renderImage = new Image3D();
    }

    const frames = await openFile(`${filepath}.bin`);
    dispatchRepLoadingProgress();

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      state.settings.data.anisotropy,
      loadingManager
    );
    await scene.init(state.settings.isDev);
    dispatchRepLoadingProgress();

    log("initializing replay");
    this.scene = await TitanReactorReplay(
      this.store,
      scene,
      this.chk,
      this.rep,
      new DataView(frames.buffer),
      renderImage,
      this.bwDat,
      new BgMusic(state.settings.data.starcraftPath)
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

    const loadingManager = new LoadingManager();

    log("loading chk");

    this.chk = new Chk(await loadScx(chkFilepath));
    window.chk = this.chk;

    dispatchMapLoadingProgress();

    document.title = `Titan Reactor - ${this.chk.title}`;

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      state.settings.data.anisotropy,
      loadingManager
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
