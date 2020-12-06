import { settings } from "cluster";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import {
  findMapsPath,
  findReplaysPath,
  findStarcraftPath,
} from "./starcraft/findInstallPath";
import fileExists from "./utils/fileExists";
const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];

const VERSION = 1;
export const RenderMode = {
  SD: 0,
  HD: 1,
  ThreeD: 2,
};

export const ShadowLevel = {
  Off: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};

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
  }

  async init() {
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
  }

  async get() {
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
    if (!(await fileExists(this._settings["starcraftPath"]))) {
      for (let folder of dataFolders) {
        if (!(await fileExists(this._settings[folder]))) {
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

  async createDefaults() {
    return {
      version: VERSION,
      renderMode: RenderMode.SD,
      maxAutoReplaySpeed: 1.5,
      language: supportedLanguages.includes(getEnvLocale())
        ? getEnvLocale()
        : "en-US",
      starcraftPath: "", //await findStarcraftPath(),
      mapsPath: await findMapsPath(),
      replaysPath: await findReplaysPath(),
      communityModelsPath: "",
      observerLink: "",
      musicVolume: 0.01,
      soundVolume: 1,
      antialias: true,
      shadows: ShadowLevel.High,
      twitch: "",
    };
  }
}
