import { app } from "electron";
import isDev from "electron-is-dev";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import path from "path";

import phrases from "../../common/phrases";
import { defaultSettings } from "../../common/settings";
import { Settings as SettingsType } from "../../common/types";
import fileExists from "../../common/utils/file-exists";
import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";

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
  private initialized = false;
  private _settings: SettingsType = {
    ...defaultSettings
  };
  private _filepath = "";

  async init(filepath: string) {
    if (this.initialized) return;

    this._filepath = filepath;

    const noop = () => { };
    try {
      this._settings = JSON.parse(
        await fsPromises.readFile(this._filepath, { encoding: "utf8" })
      );
    } catch (err) {
      try {
        await fsPromises.unlink(this._filepath);
      } catch (err) {
        noop();
      } finally {
        await this.save(await this.createDefaults());
      }
    }
    this.initialized = true;
    this._emitChanged();
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

    for (const file of files) {
      if (!(await fileExists(this._settings[file as keyof SettingsType]))) {
        errors.push(file);
      }
    }

    const dataFolders = ["Data", "locales"];
    if (await fileExists(this._settings["starcraftPath"])) {
      for (const folder of dataFolders) {
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
      phrases: {
        ...phrases["en-US"],
        ...phrases[this._settings.language],
      },
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

  async save(settings: any) {
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
      ...defaultSettings,
      language: supportedLanguages.includes(getEnvLocale())
        ? getEnvLocale()
        : "en-US",
      starcraftPath: await findStarcraftPath(),
      mapsPath: await findMapsPath(),
      replaysPath: await findReplaysPath(),
      tempPath: await findTempPath(),
    };
  }
}
