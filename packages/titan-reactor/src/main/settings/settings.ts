import { app } from "electron";
import isDev from "electron-is-dev";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import path from "path";
import yaml from "js-yaml"
import { AnyObject, toCamel, toSnake } from "../../common/utils/camel"

import phrases from "../../common/phrases";
import { defaultSettings } from "../../common/settings";
import fileExists from "../../common/utils/file-exists";
import { Settings as SettingsType } from "../../common/types";
import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
export const findTempPath = () => app.getPath("temp");

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};

const shallowDiff = (a: any, b: any) => {
  const x: any = {};
  for (const n of Object.getOwnPropertyNames(a)) {
    if (a[n] !== b[n]) {
      x[n] = b[n];
    }
  }
  return x;
};

export class Settings extends EventEmitter {
  private _settings: SettingsType = {
    ...defaultSettings
  };
  private _filepath = "";

  async init(filepath: string) {
    this._filepath = filepath;

    try {
      await this.load();
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
      "starcraft",
      "maps",
      "replays",
      "models",
      "temp",
    ];

    for (const file of files) {
      if (!(await fileExists(this._settings.directories[file as keyof SettingsType["directories"]]))) {
        errors.push(file);
      }
    }

    const isCascStorage = await foldersExist(this._settings.directories["starcraft"], ["Data", "locales"]);
    if (!isCascStorage && !await foldersExist(this._settings.directories["starcraft"], ["anim", "arr"])) {
      errors.push("starcraftPath");
    }
      

    const localLanguage = supportedLanguages.includes(getEnvLocale() as string)
      ? (getEnvLocale() as string)
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
      isCascStorage,
      phrases: {
        ...phrases["en-US"],
        ...phrases[this._settings.language as keyof typeof phrases],
      },
      diff: {},
    };
  }

 async load() {
    const contents = await fsPromises.readFile(this._filepath, {
      encoding: "utf8",
    });
    const d = toCamel(yaml.load(contents) as AnyObject);

    this._settings = d as SettingsType;
    this._emitChanged(d);
  }

  async save(settings: any) {
    if (settings.errors) {
      delete settings.errors;
    }

    const diff = shallowDiff(this._settings, settings);
    this._settings = Object.assign({}, this._settings, settings);
    await fsPromises.writeFile(this._filepath, yaml.dump(this._settings), {
      encoding: "utf8",
    });
    this._emitChanged(diff);
  }

  async _emitChanged(diff = {}) {
    this.emit("change", { ...(await this.get()), diff });
  }

  async createDefaults(): Promise<SettingsType> {
    return {
      ...defaultSettings,
      language: supportedLanguages.find(s => s === String(getEnvLocale()))
        ??
        "en-US",
      directories: {
        starcraft: await findStarcraftPath(),
        maps: await findMapsPath(),
        replays: await findReplaysPath(),
        temp: await findTempPath(),
        models: path.join(app.getPath("documents"), "3dModels")
      }
    };
  }
}
