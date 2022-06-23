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
  game: {
    stopFollowingOnClick: true
  },
  util: {
    sanityCheckReplayCommands: true,
  },
  graphics: {
    antialias: true,
    pixelRatio: "med",
    anisotropy: "high",
    gamma: 0.9,
    terrainChunky: true,
    terrainShadows: true
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  },
};