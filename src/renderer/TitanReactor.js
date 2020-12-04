import { parseReplay } from "downgrade-replay";
import { TextureCache } from "./3d-map-rendering/textures/TextureCache";
import { Tileset } from "./bwdat/Tileset";
import { getAppCachePath } from "./invoke";
import { LoadSprite } from "./mesh/LoadSprites";
import { JsonCache } from "./utils/jsonCache";
import { imageChk } from "./utils/loadChk";
import { ImageSD } from "./mesh/ImageSD";
import { Image3D } from "./mesh/Image3D";
import { TitanReactorMapSandbox } from "./TitanReactorMapSandbox";
import { TitanReactorReplay } from "./TitanReactorReplay";
import { LoadingManager } from "three";
import { TitanReactorScene } from "./Scene";
import { RenderMode } from "../main/settings";
import { BgMusic } from "./audio/BgMusic";
import { getSettings, loadAllDataFiles, openFile, log } from "./invoke";
import { UnitDAT } from "../main/units/UnitsDAT";
import loadSpritePalettes from "./image/palettes";

export const SceneMode = {
  MapViewer: 0,
  Replay: 1,
};

export class TitanReactor {
  constructor(context, reactApp) {
    this.context = context;
    this.mode = null;
    this.scene = null;
    this.reactApp = reactApp;
  }

  async init() {
    const settings = await getSettings();
    if (settings.errors.length) {
      return false;
    }

    //@todo move parsing to renderer so I don't have to reassign shit
    log("loading DAT and ISCRIPT files");
    const origBwDat = await loadAllDataFiles(settings.starcraftPath);
    this.bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat;

    this.readStarcraftFile = (file) =>
      openFile(`${settings.starcraftPath}/${file}`);

    //load sprite palettes
    this.palettes = Object.freeze(
      await loadSpritePalettes(this.readStarcraftFile)
    );

    //load sd sprites
    // const loadSprite = new LoadSprite(
    //   palettes,
    //   this.bwDat.images,
    //   (file) => openFile(`${settings.starcraftPath}/unit/${file}`),
    //   spritesTextureCache,
    //   jsonCache,
    //   this.context.renderer.capabilities.maxTextureSize,
    //   loadingManager
    // );

    // await loadSprite.loadAll();

    return true;
  }

  async spawnReplay(filepath) {
    log(`loading replay ${filepath}`);
    await this.dispose();
    const settings = await getSettings();
    const loadingManager = new LoadingManager();

    this.mode = SceneMode.Replay;
    document.title = `Titan Reactor - Replay`;

    log(`parsing replay`);
    const rep = await parseReplay(await openFile(filepath));
    log(`loading chk`);
    const chk = await imageChk(rep.chk, settings.starcraftPath);

    log(`showing loading overlay`);
    this.reactApp.overlay({
      chk,
      header: rep.header,
    });

    let renderImage;
    if (
      settings.renderMode === RenderMode.SD ||
      settings.renderMode === RenderMode.HD
    ) {
      log(`initializing sprite texture cache`);
      const spritesTextureCache = new TextureCache(
        "sd",
        await getAppCachePath(),
        "rgba"
      );
      log(`initializing json cache`);

      const jsonCache = new JsonCache("sprite-", await getAppCachePath());
      log(`loading tileset`);
      const tileset = new Tileset(
        chk.tileset,
        settings.starcraftPath,
        openFile
      );
      await tileset.load();
      log(`loading unit atlas`);
      const loadSprite = new LoadSprite(
        tileset.palettes,
        this.bwDat.images,
        (file) => openFile(`${settings.starcraftPath}/unit/${file}`),
        spritesTextureCache,
        jsonCache,
        this.context.renderer.capabilities.maxTextureSize,
        loadingManager
      );

      await loadSprite.loadAll();
      renderImage = new ImageSD(this.bwDat, settings.starcraftPath, loadSprite);
    } else {
      renderImage = new Image3D();
    }

    const textureCache = new TextureCache(chk.title, await getAppCachePath());

    const frames = await openFile(`${filepath}.bin`);

    log(`initializing scene`);
    const scene = new TitanReactorScene(chk, textureCache, loadingManager);
    await scene.init();

    log(`initializing replay`);
    this.scene = await TitanReactorReplay(
      this.context,
      filepath,
      this.reactApp,
      scene,
      chk,
      rep,
      new DataView(frames.buffer),
      renderImage,
      this.bwDat,
      new BgMusic(settings.starcraftPath)
    );
  }

  async spawnMapViewer(chkFilepath) {
    await this.dispose();
    const settings = await getSettings();

    const loadingManager = new LoadingManager();

    this.mode = SceneMode.MapViewer;
    log(`loading chk`);
    const chk = await imageChk(chkFilepath, settings.starcraftPath);
    window.chk = chk;

    this.reactApp.overlay({
      chk,
    });
    document.title = `Titan Reactor - ${chk.title}`;

    log(`initializing texture cache`);
    const textureCache = new TextureCache(chk.title, await getAppCachePath());

    log(`initializing scene`);
    const scene = new TitanReactorScene(chk, textureCache, loadingManager);
    await scene.init();

    this.scene = await TitanReactorMapSandbox(
      this.context,
      chkFilepath,
      chk,
      scene
    );
    this.reactApp.render();
  }

  dispose() {
    if (this.scene) {
      log("disposing previous scene");
      return this.scene.dispose();
    }
  }
}
