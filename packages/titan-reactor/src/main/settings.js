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
import AudioPanningStyle from "common/AudioPanningStyle";

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
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

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
    this.initialized = true;
  }

  async get() {
    if (!this.initialized) {
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
      phrases: Object.assign(
        {},
        phrases["en-US"],
        phrases[this._settings.language]
      ),
      diff: {},
    };
  }

  async load() {
    if (!this.initialized) {
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
      renderMode: RenderMode.HD,
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
      musicVolume: 0.1,
      musicAllTypes: false,
      soundVolume: 1,
      audioPanningStyle: AudioPanningStyle.Spatial,
      antialias: false,
      anisotropy: 1,
      pixelRatio: 1,
      gamma: 1.2,
      shadows: ShadowLevel.High,
      keyPanSpeed: 0.5,
      twitch: "",
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
      randomizeColorOrder: false,
      classicClock: false,
      playerColors: [
        "f40404",
        "0c48cc",
        "2cb494",
        "88409c",
        "f88c14",
        "703014",
        "cce0d0",
        "fcfc38",
      ],
      hudFontSize: "lg",
      minimapRatio: 25,
      replayAndUnitDetailSize: "24vw",
      fpsLimit: 200,
      autoToggleProductionView: true,
    };
  }
}
