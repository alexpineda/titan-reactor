import { savePNG, loadPNG } from "image/png";
import { DefaultLoadingManager } from "three";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import sanitize from "sanitize-filename";

export class TextureCache {
  constructor(
    baseName,
    dir,
    format = "rgb",
    loadingManager = DefaultLoadingManager
  ) {
    this.baseName = sanitize(baseName);
    this.dir = dir;
    this.format = format;
    this.loadingManager = loadingManager;
  }

  _name(name) {
    return path.join(this.dir, `${this.baseName}-${name}.png`);
  }

  async save(name, data, width, height) {
    console.log("saving", this._name(name));
    return await savePNG(data, width, height, this._name(name), this.format);
  }

  exists(name) {
    return fsPromises
      .access(this._name(name), fs.constants.R_OK)
      .then((_) => true)
      .catch((_) => false);
  }

  get(name) {
    return loadPNG(this._name(name));
  }
}
