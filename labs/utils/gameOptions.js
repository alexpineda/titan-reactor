// import { getAppCachePath } from "../../electron/invoke";
const path = window.require("path");
const { app } = require("electron");

export const getAppCachePath = async (folder) => {
  return path.join(app.getPath("appData"), folder);
};

class GameOptions {
  constructor() {
    this.load();
  }
  async load() {
    this.cachePath = await getAppCachePath("MapData");
    this.bwDataPath = "./bwdata";
  }
}

export const gameOptions = new GameOptions();
