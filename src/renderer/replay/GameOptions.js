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

export const ShadowLevel = {
  Off: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};

export class GameOptions extends EventDispatcher {
  constructor(context) {
    super();
    this.context = context;
    this.renderMode = RenderMode.SD;
    this.maxAutoReplaySpeed = 1.5;
    this.language = "en";
    this.starcraftPath = "";
    this.communityModelsPath = "";
    this.observerLink = "";
    this.musicVolume = 0.01;
    this.soundVolume = 1;
    this.antialias = true;
    this.shadows = ShadowLevel.High;
    this.twitch = "";
  }

  async load() {}

  is2d() {
    return [RenderMode.SD, RenderMode.HD].includes(this.renderMode);
  }
}

export const gameOptions = new GameOptions();
