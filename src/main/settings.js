import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import { RenderMode, ShadowLevel } from "common/settings";
import {
  findMapsPath,
  findReplaysPath,
  findStarcraftPath,
} from "./starcraft/findInstallPath";
import fileExists from "./utils/fileExists";
import path from "path";
const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];

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
    try {
      // await fsPromises.unlink(this._filepath);

      this._settings = JSON.parse(
        await fsPromises.readFile(this._filepath, { encoding: "utf8" })
      );
    } catch (err) {
      try {
        await fsPromises.unlink(this._filepath);
      } catch (err) {
      } finally {
        await this.save(await this.createDefaults(webGLCapabilities));
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

    const dataFolders = [
      "anim",
      "arr",
      "cursor",
      "game",
      "music",
      "portrait",
      "scripts",
      "sound",
      "TileSet",
      "unit",
    ];
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

    return { ...this._settings, errors };
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
    this.emit("change", { diff, settings: await this.get() });
  }

  async createDefaults(webGLCapabilities) {
    return {
      version: VERSION,
      renderMode: RenderMode.SD,
      maxAutoReplaySpeed: 1.5,
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
      antialias: true,
      anisotropy: webGLCapabilities.anisotropy,
      maxAnisotropy: webGLCapabilities.anisotropy,
      gamma: 2,
      shadows: ShadowLevel.High,
      twitch: "",
      countdownTimer: true,
      orthoCamera: false,
      mapsRss: "",
      replaysRss: "",
      useCustomColors: false,
      player1Color: "#ef4444",
      player2Color: "#3b82f6",
    };
  }
}