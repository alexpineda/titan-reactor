import { Settings, AssetTextureResolution } from "./types";

export const defaultSettings: Settings = {
  version: 4,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    assets: "",
    plugins: ""
  },
  assets: {
    images: AssetTextureResolution.HD2,
    terrain: AssetTextureResolution.SD,
  },
  audio: {
    global: 1,
    music: 0.5,
    sound: 1
  },
  graphics: {
    antialias: true,
    pixelRatio: "med",
    anisotropy: "high",
    gamma: 0.9,
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  }
};