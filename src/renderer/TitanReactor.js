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
import { getSettings } from "./invoke";
import { RenderMode } from "../main/settings";

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
    const settings = await getSettings();
    const loadingManager = new LoadingManager();

    this.mode = SceneMode.Replay;
    document.title = `Titan Reactor - Replay`;

    console.log("1");
    const rep = await parseReplay(await this.fileAccess(filepath));
    console.log("2");
    const chk = await imageChk(rep.chk, this.context.bwDataPath);
    console.log("13");

    this.reactApp.overlay({
      chk,
      header: rep.header,
    });

    let renderImage;
    if (
      settings.renderMode === RenderMode.SD ||
      settings.renderMode === RenderMode.HD
    ) {
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
      console.log("4");
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
      console.log("5");
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

    console.log("6");
    const scene = new TitanReactorScene(chk, textureCache, loadingManager);
    await scene.init();
    console.log("7");

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
    console.log("done");
  }

  async spawnMapViewer(chkFilepath) {
    await this.dispose();
    const settings = await getSettings();

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
