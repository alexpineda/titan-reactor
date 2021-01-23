import { DefaultLoadingManager } from "three";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import sanitize from "sanitize-filename";

export class JsonCache {
  constructor(baseName, dir, loadingManager = DefaultLoadingManager) {
    this.baseName = sanitize(baseName);
    this.dir = dir;
    this.loadingManager = loadingManager;
  }

  _name(name) {
    return path.join(this.dir, `${this.baseName}-${name}.json`);
  }

  async save(name, data) {
    return fsPromises.writeFile(this._name(name), JSON.stringify(data));
  }

  exists(name) {
    return fsPromises
      .access(this._name(name), fs.constants.R_OK)
      .then((_) => true)
      .catch((_) => false);
  }

  get(name) {
    return fsPromises
      .readFile(this._name(name), "utf8")
      .then((res) => JSON.parse(res));
  }
}
