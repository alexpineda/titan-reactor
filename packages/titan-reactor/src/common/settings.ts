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
    pixelRatio: "device",
    fullscreen: true,
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
  // alwaysHideReplayControls: false,
  // language: "en-US",
  // starcraftPath: "",
  // mapsPath: "",
  // replaysPath: "",
  // tempPath: "",
  // communityModelsPath: "",
  // observerLink: "",
  // musicVolume: 0.1,
  // musicAllTypes: false,
  // soundVolume: 1,
  // antialias: 4,
  // anisotropy: 1,
  // pixelRatio: 1,
  // gamma: 1.2,
  // keyPanSpeed: 0.5,
  // twitch: "",
  // fullscreen: true,
  // enablePlayerScores: true,
  // esportsHud: true,
  // embedProduction: true,
  // cameraShake: 1,
  // useCustomColors: false,
  // randomizeColorOrder: false,
  // classicClock: false,
  // hudFontSize: "sm",
  // minimapRatio: 25,
  // replayAndUnitDetailSize: "24vw",
  // fpsLimit: 200,
  // autoToggleProductionView: true,
  // showDisabledDoodads: false,
  // showCritters: true,
  // mouseRotateSpeed: 0.1,
  // mouseDollySpeed: 0.1,
  // mapBackgroundColor: "#000000",
};