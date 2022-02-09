import { Settings, AssetTextureResolution } from "./types";

export const defaultSettings: Settings = {
  version: 2,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    models: "",
    temp: ""
  },
  playerColors: {
    ignoreReplayColors: true,
    randomizeOrder: false
  },
  assets: {
    images: AssetTextureResolution.HD2,
    terrain: AssetTextureResolution.SD,
  },
  audio: {
    global: 1,
    music: 0.1,
    sound: 1
  },
  graphics: {
    antialias: true,
    pixelRatio: "med",
    anisotropy: "high",
    fullscreen: false,
    gamma: 0.9,
    showFps: true
  },
  controls: {
    debug: false,
    mode: {
      default: "F2, Escape",
      battle: "F5",
      overview: "F7",
    },
    replay: {
      pause: "KeyP",
      speedUp: "KeyU",
      speedDown: "KeyD",
      skipForward: "BracketRight",
      skipBackward: "BracketLeft",
    },
    camera: {
      truckLeft: "ArrowLeft",
      truckRight: "ArrowRight",
      forward: "ArrowUp",
      backward: "ArrowDown",
      zoomIn: "NumpadAdd",
      zoomOut: "NumpadSubtract",
    }
  }
};