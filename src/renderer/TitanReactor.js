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
import { getSettings, log } from "./invoke";
import { RenderMode } from "../main/settings";
import { BgMusic } from "./audio/BgMusic";

export const SceneMode = {
  MapViewer: 0,
  Replay: 1,
};

export class TitanReactor {
  constructor(context, reactApp, fileAccess, bwDat) {
    this.context = context;
    this.mode = null;
    this.scene = null;
    this.reactApp = reactApp;
    this.fileAccess = fileAccess;
    this.bwDat = bwDat;
  }

  async spawnReplay(filepath) {
    log(`loading replay ${filepath}`);
    await this.dispose();
    const settings = await getSettings();
    const loadingManager = new LoadingManager();

    this.mode = SceneMode.Replay;
    document.title = `Titan Reactor - Replay`;

    log(`parsing replay`);
    const rep = await parseReplay(await this.fileAccess(filepath));
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
        this.fileAccess
      );
      await tileset.load();
      log(`loading unit atlas`);
      const loadSprite = new LoadSprite(
        tileset,
        this.bwDat.images,
        (file) => this.fileAccess(`${settings.starcraftPath}/unit/${file}`),
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

    const frames = await this.fileAccess(`${filepath}.bin`);

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
