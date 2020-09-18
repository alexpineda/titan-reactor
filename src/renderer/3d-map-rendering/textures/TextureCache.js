import { savePNG } from "../../2d-map-rendering/image/png";
import { TextureLoader, DefaultLoadingManager, sRGBEncoding } from "three";
import fs, { promises as fsPromises } from "fs";

export class TextureCache {
  constructor(baseName, loadingManager = DefaultLoadingManager) {
    this.baseName = baseName;
    this.loadingManager = loadingManager;
  }

  _name(id) {
    return `${this.baseName}-${id}.png`;
  }

  async save(name, data, width, height) {
    return await savePNG(data, width, height, this._name(name));
  }

  exists(name) {
    return fsPromises.access(this._name(name), fs.constants.R_OK);
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
