import { SettingsV6, SettingsV5 } from "./types";

export const defaultSettingsV6: SettingsV6 = {
  version: 6,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    assets: "",
    plugins: ""
  },
  assets: {
    preload: false,
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
    pixelRatio: 1,
  },
  postprocessing: {
    anisotropy: 0,
    antialias: 0,
    bloom: 0,
    brightness: 0,
    contrast: 0,
    toneMapping: 0,
  },
  postprocessing3d: {
    anisotropy: 0,
    antialias: 0,
    bloom: 1,
    brightness: 0,
    contrast: 0,
    toneMapping: 1,
    depthFocalLength: 0.5,
    depthBlurQuality: 240,
    depthBokehScale: 1,
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

export const defaultSettingsV5: SettingsV5 = {
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
    terrain: "hd",
    images: 'hd',
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
    anisotropy: "low",
    pixelRatio: "low",
    antialias: false,
    terrainShadows: false
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

export const defaultSettings = defaultSettingsV6;
