import {
  DefaultLoadingManager,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  sRGBEncoding,
  Vector2,
} from "three";
import { Grp } from "../../../../libs/bw-chk/grp";
import { Buffer } from "buffer/";

export class LoadSprite {
  constructor(loadingManager = DefaultLoadingManager, fileAccess) {
    this.loadingManager = loadingManager;
    this.fileAccess = fileAccess;
  }

  async loadGrp(file, name, userData) {
    this.loadingManager.itemStart(file);
    const buf = await this.fileAccess(file);
    const grp = new Grp(buf, Buffer);
    this.loadingManager.itemEnd(file);
    return grp;
  }

  load(file, name = "", userData = {}) {
    return new Promise((resolve, reject) => {
      new TextureLoader(this.loadingManager).load(
        file,
        (map) => {
          map.encoding = sRGBEncoding;
          const sprite = new Sprite(new SpriteMaterial({ map }));
          sprite.center = new Vector2(0.5, 0);
          Object.assign(sprite, { name, userData });
          resolve(sprite);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });
  }

  loadSync(file, name = "", userData = {}) {
    const map = new TextureLoader(this.loadingManager).load(file);
    map.encoding = sRGBEncoding;
    const sprite = new Sprite(new SpriteMaterial({ map }));
    sprite.center = new Vector2(0.5, 0);

    return sprite;
  }
}
