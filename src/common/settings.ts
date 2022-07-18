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
    images: AssetTextureResolution.HD,
    terrain: AssetTextureResolution.HD,
  },
  audio: {
    global: 1,
    music: 0.5,
    sound: 1
  },
  game: {
    stopFollowingOnClick: true,
    minimapSize: 0.25
  },
  util: {
    sanityCheckReplayCommands: true,
    debugMode: false
  },
  graphics: {
    antialias: true,
    pixelRatio: "med",
    anisotropy: "high",
    terrainShadows: true
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  },
};