import { TextureCache } from "./3d-map-rendering/textures/TextureCache";
import { getAppCachePath, loadChk, loadScx } from "./invoke";
import { LoadSprite } from "./mesh/LoadSprites";
import { JsonCache } from "./utils/jsonCache";
import { imageChk } from "./utils/loadChk";
import { ImageSD } from "./mesh/ImageSD";
import { Image3D } from "./mesh/Image3D";
import EmptyImage from "./mesh/EmptyImage";
import TitanReactorMap from "./TitanReactorMap";
import TitanReactorReplay from "./TitanReactorReplay";
import { DefaultLoadingManager, LoadingManager } from "three";
import { TitanReactorScene } from "./TitanReactorScene";
import { RenderMode } from "common/settings";
import BgMusic from "./audio/BgMusic";
import { loadReplayFromFile, loadAllDataFiles, openFile, log } from "./invoke";
import { UnitDAT } from "../main/units/UnitsDAT";
import loadSpritePalettes from "./image/palettes";
import { parseReplay } from "downgrade-replay";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import {
  loading,
  loadingProgress,
  loadingError,
  criticalErrorOccurred,
} from "./titanReactorReducer";

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
    this.store.dispatch(loading("preload", state.settings.isDev ? 1 : 3));

    //@todo move parsing to renderer so I don't have to reassign shit
    log("loading DAT and ISCRIPT files");
    const origBwDat = await loadAllDataFiles(state.settings.data.starcraftPath);
    this.bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat;
    dispatchPreloadLoadingProgress();
    if (state.settings.isDev) {
      return;
    }

    this.readStarcraftFile = (file) =>
      openFile(`${state.settings.data.starcraftPath}/${file}`);

    //load sprite palettes
    this.palettes = Object.freeze(
      await loadSpritePalettes(this.readStarcraftFile)
    );

    dispatchPreloadLoadingProgress();

    log("initializing sprite texture cache");
    const spritesTextureCache = new TextureCache(
      "sd",
      await getAppCachePath(),
      "rgba"
    );

    log("initializing json cache");
    const jsonCache = new JsonCache("sprite-", await getAppCachePath());

    log("loading unit atlas");
    this.loadSprite = new LoadSprite(
      this.palettes,
      this.bwDat.images,
      (file) => openFile(`${state.settings.data.starcraftPath}/unit/${file}`),
      spritesTextureCache,
      jsonCache,
      8192,
      DefaultLoadingManager
    );

    await this.loadSprite.loadAll();

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
    await this.dispose();

    log("parsing replay");
    this.rep = await parseReplay(await openFile(filepath));
    // const rep = await loadReplayFromFile(filepath);
    dispatchRepLoadingProgress();

    log("loading chk");
    this.store.dispatch(loading("chk"));
    this.chk = await imageChk(this.rep.chk, state.settings.data.starcraftPath);
    this.chkPreviewCanvas = await mapPreviewCanvas(this.chk);
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

    const textureCache = new TextureCache(
      this.chk.title,
      await getAppCachePath()
    );

    const frames = await openFile(`${filepath}.bin`);
    dispatchRepLoadingProgress();

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      textureCache,
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

    await this.dispose();

    const loadingManager = new LoadingManager();

    log("loading chk");
    this.chk = await imageChk(chkFilepath, state.settings.data.starcraftPath);
    window.chk = this.chk;

    this.chkPreviewCanvas = await mapPreviewCanvas(this.chk);
    dispatchMapLoadingProgress();

    document.title = `Titan Reactor - ${this.chk.title}`;

    log("initializing texture cache");
    const textureCache = new TextureCache(
      this.chk.title,
      await getAppCachePath()
    );

    log("initializing scene");
    const scene = new TitanReactorScene(
      this.chk,
      textureCache,
      state.settings.data.anisotropy,
      loadingManager
    );
    await scene.init();

    dispatchMapLoadingProgress();

    this.scene = await TitanReactorMap(
      this.store,
      chkFilepath,
      this.chk,
      scene
    );
    dispatchMapLoadingProgress();
  }

  dispose() {
    if (this.scene) {
      log("disposing previous scene");
      return this.scene.dispose();
    }
  }
}
