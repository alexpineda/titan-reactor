import { SettingsV6, SettingsV5 } from "./types";

export const defaultSettingsV6: SettingsV6 = {
  version: 6,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    assets: "",
    plugins: "",
  },

  audio: {
    global: 0.5,
    music: 0.5,
    sound: 0.5,
    playIntroSounds: true,
  },
  minimap: {
    enabled: true,
    mode: "3d",
    position: [0, 0],
    scale: 1,
    opacity: 1,
    rotation: [0, 0, 0],
    softEdges: true,
    interactive: true,
    drawCamera: true,
  },
  input: {
    sceneController: "@titan-reactor-plugins/camera-standard",
    sandBoxMode: false,
    dampingFactor: 0.15,
    cameraShakeStrength: 1,
    movementSpeed: 1,
    rotateSpeed: 1,
    zoomLevels: [0.5, 1, 2],
    unitSelection: true,
  },
  utilities: {
    sanityCheckReplayCommands: true,
    debugMode: false,
    detectMeleeObservers: false,
    detectMeleeObserversThreshold: 1000,
    alertDesynced: true,
    alertDesyncedThreshold: 10
  },
  graphics: {
    pixelRatio: 1,
    useHD2: "force",
    preload: false,
  },
  postprocessing: {
    anisotropy: 0,
    antialias: 0,
    bloom: 0,
    brightness: 0,
    contrast: 0,
    toneMapping: 0,
    fogOfWar: 1,
  },
  postprocessing3d: {
    anisotropy: 0,
    antialias: 0,
    bloom: 1,
    brightness: 0,
    contrast: 0,
    toneMapping: 1,
    depthFocalLength: 0.5,
    depthFocalRange: 20,
    depthBlurQuality: 240,
    depthBokehScale: 1,
    fogOfWar: 1,
    envMap: 0.5,
    sunlightColor: "#cbcbcb",
    sunlightDirection: [-9, 43, -45],
    sunlightIntensity: 5,
    shadowIntensity: 0.8,
    shadowQuality: 8
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  },
  macros: {
    revision: 0,
    macros: [],
  },
};

export const defaultSettingsV5: SettingsV5 = {
  version: 5,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    assets: "",
    plugins: "",
  },
  assets: {
    terrain: "hd",
    images: "hd",
    preload: false,
    enable3dAssets: true,
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
    debugMode: false,
  },
  graphics: {
    anisotropy: "low",
    pixelRatio: "low",
    antialias: false,
    terrainShadows: false,
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  },
  macros: {
    revision: 0,
    macros: [],
  },
};

export const defaultSettings = defaultSettingsV6;
