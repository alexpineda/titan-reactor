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
    await this.dispose();
    const loadingManager = new LoadingManager();

    this.mode = SceneMode.Replay;
    document.title = `Titan Reactor - Replay`;

    const rep = await parseReplay(await this.fileAccess(filepath));
    const chk = await imageChk(rep.chk, this.context.bwDataPath);

    this.reactApp.overlay({
      chk,
      header: rep.header,
    });

    let renderImage;
    if (this.context.options.is2d()) {
      const spritesTextureCache = new TextureCache(
        "sd",
        await getAppCachePath(),
        "rgba"
      );

      const jsonCache = new JsonCache("sprite-", await getAppCachePath());
      const tileset = new Tileset(
        chk.tileset,
        this.context.bwDataPath,
        this.fileAccess
      );
      await tileset.load();
      const loadSprite = new LoadSprite(
        tileset,
        this.bwDat.images,
        (file) => this.fileAccess(`${this.context.bwDataPath}/unit/${file}`),
        spritesTextureCache,
        jsonCache,
        this.context.renderer.capabilities.maxTextureSize,
        loadingManager
      );

      await loadSprite.loadAll();
      renderImage = new ImageSD(
        this.bwDat,
        this.context.bwDataPath,
        loadSprite
      );
    } else {
      renderImage = new Image3D();
    }

    const textureCache = new TextureCache(chk.title, await getAppCachePath());

    const frames = await this.fileAccess(`${filepath}.bin`);

    const scene = new TitanReactorScene(chk, textureCache, loadingManager);
    await scene.init();

    this.scene = await TitanReactorReplay(
      this.context,
      filepath,
      this.reactApp,
      scene,
      chk,
      rep,
      new DataView(frames.buffer),
      renderImage,
      this.bwDat
    );
  }

  async spawnMapViewer(chkFilepath) {
    await this.dispose();
    const loadingManager = new LoadingManager();

    this.mode = SceneMode.MapViewer;
    const chk = await imageChk(chkFilepath, this.context.bwDataPath);
    window.chk = chk;

    this.reactApp.overlay({
      chk,
    });
    document.title = `Titan Reactor - ${chk.title}`;

    const textureCache = new TextureCache(chk.title, await getAppCachePath());

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
      return this.scene.dispose();
    }
  }
}
