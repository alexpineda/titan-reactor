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
    pixelRatio: "max",
    anisotropy: "max",
    fullscreen: true,
    gamma: 0.9
  },
  controls: {
    keyboard: {
      replay: {
        pause: "KeyP",
        speedUp: "KeyU",
        speedDown: "KeyD",
        skipForward: "BracketRight",
        skipBackward: "BracketLeft",
      },
      camera: {
        truckLeft: "ArrowLeft, KeyA",
        truckRight: "ArrowRight, KeyD",
        forward: "ArrowUp, KeyW",
        backward: "ArrowDown, KeyS",
        focus: "KeyF"
      }

    }
  }
};