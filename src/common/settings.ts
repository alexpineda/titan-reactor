import { Settings, AssetTextureResolution } from "./types";

export const defaultSettings: Settings = {
  version: 5,
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
    preload: false,
    enable3dAssets: true
  },
  audio: {
    global: 0.5,
    music: 0.5,
    sound: 0.5,
    playIntroSounds: true,
  },
  game: {
    sceneController: "@titan-reactor-plugins/camera-standard",
    minimapSize: 1,
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
  macros: {
    revision: 0,
    macros: [],
  }
};

export const defaultSettingsV5 = defaultSettings;