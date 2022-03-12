import { Settings, AssetTextureResolution } from "./types";

export const defaultSettings: Settings = {
  version: 3,
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
      helicopterRotateSpeed: 0.9,
    }
  },
  battleCam: {
    shakeMultiplier: 1,
    fogofwar: false,
    scanlines: true,
  },
  plugins: {
    serverPort: 8080,
    enabled: [],
  }
};