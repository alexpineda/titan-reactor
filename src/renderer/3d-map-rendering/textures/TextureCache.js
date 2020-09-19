import { savePNG } from "../../2d-map-rendering/image/png";
import { TextureLoader, DefaultLoadingManager, sRGBEncoding } from "three";
import fs, { promises as fsPromises } from "fs";
import path from "path";

export class TextureCache {
  constructor(baseName, dir, loadingManager = DefaultLoadingManager) {
    console.log("dir", dir);
    this.baseName = baseName;
    this.dir = dir;
    this.loadingManager = loadingManager;
  }

  _name(name) {
    return path.join(this.dir, `${this.baseName}-${name}.png`);
  }

  async save(name, data, width, height) {
    console.log("saving", this._name(name));
    return await savePNG(data, width, height, this._name(name));
  }

  exists(name) {
    return fsPromises
      .access(this._name(name), fs.constants.R_OK)
      .catch((_) => null);
  }

  get(name) {
    return new Promise((res) => {
      const loader = new TextureLoader(this.loadingManager);

      loader.load(
        this._name(name),

        function (texture) {
          texture.encoding = sRGBEncoding;
          res(texture);
        },

        undefined,

        function () {
          res(null);
        }
      );
    });
  }
}
