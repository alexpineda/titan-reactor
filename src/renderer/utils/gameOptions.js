// // import { getAppCachePath } from "../../electron/invoke";
// const path = window.require("path");
// const { app } = require("electron");

import { EventDispatcher } from "three";

// export const getAppCachePath = async (folder) => {
//   return path.join(app.getPath("appData"), folder);
// };
export const RenderMode = {
  SD: 0,
  HD: 1,
  ThreeD: 2,
};

export class GameOptions extends EventDispatcher {
  constructor() {
    super();
    this.renderMode = RenderMode.SD;
  }

  async load() {
    this.cachePath = "~/dev/cache/MapData"; //await getAppCachePath("MapData");
    this.bwDataPath = "./bwdata";
  }

  getBwDataPath() {
    return this.bwDataPath;
  }

  getRenderMode() {
    return this.renderMode;
  }

  is2d() {
    return [RenderMode.SD, RenderMode.HD].includes(this.renderMode);
  }
}
