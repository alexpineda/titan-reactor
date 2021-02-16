import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import {
  RenderMode,
  ShadowLevel,
  ProducerWindowPosition,
  GameAspect,
} from "common/settings";
import isDev from "electron-is-dev";

import {
  findMapsPath,
  findReplaysPath,
  findStarcraftPath,
} from "./starcraft/findInstallPath";
import fileExists from "titan-reactor-shared/utils/fileExists";
import path from "path";
const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
import phrases from "common/phrases";

const VERSION = 1;

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};

const shallowDiff = (a, b) => {
  const x = {};
  for (let n of Object.getOwnPropertyNames(a)) {
    if (a[n] !== b[n]) {
      x[n] = b[n];
    }
  }
  return x;
};

export class Settings extends EventEmitter {
  constructor(filepath) {
    super();
    this._settings = {};
    this._filepath = filepath;
    this._initialized = false;
  }

  async init(webGLCapabilities) {
    this.webGLCapabilities = webGLCapabilities;

    try {
      this._settings = JSON.parse(
        await fsPromises.readFile(this._filepath, { encoding: "utf8" })
      );
    } catch (err) {
      try {
        await fsPromises.unlink(this._filepath);
      } catch (err) {
      } finally {
        await this.save(await this.createDefaults());
      }
    }
    this._initialized = true;
  }

  async get() {
    if (!this._initialized) {
      throw new Error("settings not initialized");
    }
    const errors = [];
    const files = [
      "starcraftPath",
      "mapsPath",
      "replaysPath",
      "communityModelsPath",
    ];

    for (let file of files) {
      if (!(await fileExists(this._settings[file]))) {
        errors.push(file);
      }
    }

    const dataFolders = ["Data", "locales"];
    if (await fileExists(this._settings["starcraftPath"])) {
      for (let folder of dataFolders) {
        if (
          !(await fileExists(
            path.join(this._settings["starcraftPath"], folder)
          ))
        ) {
          if (!errors.includes("starcraftPath")) {
            errors.push("starcraftPath");
          }
        }
      }
    }

    const localLanguage = supportedLanguages.includes(getEnvLocale())
      ? getEnvLocale()
      : "en-US";
    this._settings.language = supportedLanguages.includes(
      this._settings.language
    )
      ? this._settings.language
      : localLanguage;

    return {
      data: { ...(await this.createDefaults()), ...this._settings },
      errors,
      isDev,
      phrases: phrases[this._settings.language],
      diff: {},
    };
  }

  async load() {
    if (!this._initialized) {
      throw new Error("settings not initialized");
    }
    const contents = await fsPromises.readFile(this._filepath, {
      encoding: "utf8",
    });
    const newData = JSON.parse(contents);
    this._settings = newData;
    this._emitChanged();
  }

  async save(settings) {
    if (settings.errors) {
      delete settings.errors;
    }

    const diff = shallowDiff(this._settings, settings);
    this._settings = Object.assign({}, this._settings, settings);
    await fsPromises.writeFile(this._filepath, JSON.stringify(this._settings), {
      encoding: "utf8",
    });
    this._emitChanged(diff);
  }

  async _emitChanged(diff = {}) {
    this.emit("change", { ...(await this.get()), diff });
  }

  async createDefaults() {
    return {
      version: VERSION,
      renderMode: RenderMode.SD,
      maxAutoReplaySpeed: 1.2,
      alwaysHideReplayControls: true,
      startPaused: false,
      language: supportedLanguages.includes(getEnvLocale())
        ? getEnvLocale()
        : "en-US",
      starcraftPath: await findStarcraftPath(),
      mapsPath: await findMapsPath(),
      replaysPath: await findReplaysPath(),
      communityModelsPath: "",
      observerLink: "",
      musicVolume: 0.01,
      soundVolume: 1,
      antialias: false,
      anisotropy: 1,
      pixelRatio: 1,
      maxAnisotropy: this.webGLCapabilities.anisotropy,
      gamma: 1.2,
      shadows: ShadowLevel.High,
      shadowTextureSize: 0.5,
      keyPanSpeed: 0.5,
      twitch: "",
      countdownTimer: true,
      cameraStyle2dOrtho: true,
      cameraStyle3dOrtho: false,
      producerWindowPosition: ProducerWindowPosition.None,
      producerDockSize: 300,
      gameAspect: GameAspect.Fit,
      fullscreen: true,
      enablePlayerScores: true,
      esportsHud: true,
      showTooltips: true,
      cameraShake: 1,
      mapsRss: "",
      replaysRss: "",
      useCustomColors: false,
      usePlayerColorUnitSelection: true,
      player1Color: "#ef4444",
      player2Color: "#3b82f6",

      hudFontSize: "sm",
      esportsHudSize: "lg",
      minimapRatio: 25,
      replayAndUnitDetailSize: "24vw",
      showWorkerCount: true,
      showArmyCount: true,
    };
  }
}
