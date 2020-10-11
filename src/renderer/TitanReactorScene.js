import { parseReplay } from "downgrade-replay";
import { TextureCache } from "./3d-map-rendering/textures/TextureCache";
import { TitanReactorSandbox } from "./3d-map-rendering/TitanReactorSandbox";
import { Tileset } from "./bwdat/Tileset";
import { getAppCachePath } from "./invoke";
import { LoadSprite } from "./mesh/LoadSprites";
import { JsonCache } from "./utils/jsonCache";
import { imageChk } from "./utils/loadChk";
import { ImageSD } from "./mesh/ImageSD";
import { Image3D } from "./mesh/Image3D";
import { TitanReactorReplay } from "./replay/TitanReactorReplay";

export const SceneMode = {
  MapViewer: 0,
  Replay: 1,
};

export class TitanReactorScene {
  constructor(context, reactApp, fileAccess, gameOptions, bwDat) {
    this.context = context;
    this.mode = null;
    this.scene = null;
    this.reactApp = reactApp;
    this.fileAccess = fileAccess;
    this.gameOptions = gameOptions;
    this.bwDat = bwDat;
  }

  async spawnReplay(filepath) {
    await this.dispose();
    this.mode = SceneMode.Replay;
    document.title = `Titan Reactor - Replay`;

    const rep = await parseReplay(await this.fileAccess(filepath));
    const chk = await imageChk(rep.chk, this.gameOptions.getBwDataPath());

    this.reactApp.overlay({
      chk,
    });

    let renderImage;
    if (this.gameOptions.is2d()) {
      const spritesTextureCache = new TextureCache(
        "sd",
        await getAppCachePath(),
        "rgba"
      );

      const jsonCache = new JsonCache("sprite-", await getAppCachePath());
      const tileset = new Tileset(
        chk.tileset,
        this.gameOptions.getBwDataPath(),
        this.fileAccess
      );
      await tileset.load();
      const loadSprite = new LoadSprite(
        tileset,
        this.bwDat.images,
        (file) =>
          this.fileAccess(`${this.gameOptions.getBwDataPath()}/unit/${file}`),
        spritesTextureCache,
        jsonCache,
        //@todo init renderer here and get renderer.capabilities.maxTextureSize
        8192
      );

      await loadSprite.loadAll();
      renderImage = new ImageSD(
        this.bwDat,
        this.gameOptions.getBwDataPath(),
        loadSprite
      );
    } else {
      renderImage = new Image3D();
    }

    const mapTexturesCache = new TextureCache(
      chk.title,
      await getAppCachePath()
    );

    const frames = await this.fileAccess(`${filepath}.bin`);

    this.scene = await TitanReactorReplay(
      this.context,
      filepath,
      this.reactApp,
      chk,
      rep,
      new DataView(frames.buffer),
      renderImage,
      this.bwDat,
      mapTexturesCache
    );
  }

  async spawnMapViewer(chkFilepath) {
    await this.dispose();

    this.mode = SceneMode.MapViewer;
    const chk = await imageChk(chkFilepath, this.gameOptions.getBwDataPath());
    window.chk = chk;

    this.reactApp.overlay({
      chk,
    });
    document.title = `Titan Reactor - ${chk.title}`;

    this.scene = await TitanReactorSandbox(
      this.context,
      chkFilepath,
      chk,
      this.context.getGameCanvas()
    );
    this.reactApp.render();
  }

  dispose() {
    if (this.scene) {
      return this.scene.dispose();
    }
  }
}
