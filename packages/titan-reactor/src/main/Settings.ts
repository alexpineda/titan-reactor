import { app } from "electron";
import isDev from "electron-is-dev";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import path from "path";

import phrases from "../common/phrases";
import { RenderMode } from "../common/settings";
import { Settings as SettingsType } from "../common/types";
import fileExists from "../common/utils/fileExists";
import { findMapsPath, findReplaysPath, findStarcraftPath } from "./starcraft/findInstallPath";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
const VERSION = 1;
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
  private _settings: any = {};
  private _filepath = "";

  async init(filepath: string) {
    if (this.initialized) return;

    this._filepath = filepath;

    const noop = () => {};
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
      version: VERSION,
      renderMode: RenderMode.HD,
      alwaysHideReplayControls: false,
      language: supportedLanguages.includes(getEnvLocale())
        ? getEnvLocale()
        : "en-US",
      starcraftPath: await findStarcraftPath(),
      mapsPath: await findMapsPath(),
      replaysPath: await findReplaysPath(),
      tempPath: await findTempPath(),
      communityModelsPath: "",
      observerLink: "",
      musicVolume: 0.1,
      musicAllTypes: false,
      soundVolume: 1,
      antialias: false,
      anisotropy: 1,
      pixelRatio: 1,
      gamma: 1.2,
      keyPanSpeed: 0.5,
      twitch: "",
      fullscreen: true,
      enablePlayerScores: true,
      esportsHud: true,
      embedProduction: true,
      cameraShake: 1,
      useCustomColors: false,
      randomizeColorOrder: false,
      classicClock: false,
      playerColors: [
        "#f40404",
        "#0c48cc",
        "#2cb494",
        "#88409c",
        "#f88c14",
        "#703014",
        "#cce0d0",
        "#fcfc38",
      ],
      hudFontSize: "sm",
      minimapRatio: 25,
      replayAndUnitDetailSize: "24vw",
      fpsLimit: 200,
      autoToggleProductionView: true,
      showDisabledDoodads: false,
      showCritters: true,
      mouseRotateSpeed: 0.1,
      mouseDollySpeed: 0.1,
      mapBackgroundColor: "#000000",
    };
  }
}
