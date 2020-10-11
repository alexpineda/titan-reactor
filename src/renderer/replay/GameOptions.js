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
  constructor(context) {
    super();
    this.context = context;
    this.renderMode = RenderMode.SD;
  }

  async load() {}

  getRenderMode() {
    return this.renderMode;
  }

  is2d() {
    return [RenderMode.SD, RenderMode.HD].includes(this.renderMode);
  }
}
