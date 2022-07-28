import { app } from "electron";
import { promises as fsPromises } from "fs";
import path from "path";

import phrases from "common/phrases";
import { defaultSettings } from "common/settings";
import fileExists from "common/utils/file-exists";
import { Settings as SettingsType, SettingsMeta } from "common/types";

import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";
import migrate from "./migrate";
import loadPlugins, { getDisabledPluginPackages, getEnabledPluginPackages, getPluginsMetaData } from "../plugins/load-plugins";
import { findPluginsPath } from "../starcraft/find-plugins-path";
import withErrorMessage from "common/utils/with-error-message";
import log from "../log";
import { sanitizeMacros } from "common/sanitize-macros";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};

/**
 * A settings management utility which saves and loads settings from a file.
 * It will also emit a "change" event whenever the settings are loaded or saved.
 */
export class Settings {
  private _settings: SettingsType = {
    ...defaultSettings
  };
  private _filepath = "";

  /**
   * Loads the existing settings file from disk.
   * It will migrate the settings if they are not compatible with the current version.
   * It will create a new settings file if it does not exist.
   * @param filepath 
   */
  async init(filepath: string) {
    this._filepath = filepath;
    this.initialize();
  }

  async initialize() {
    if (await fileExists(this._filepath)) {
      await this.loadAndMigrate();
    } else {
      await this.save(await this.createDefaults());
    }

    await loadPlugins(this._settings.directories.plugins);
  }

  get() {
    return this._settings;
  }

  async disablePlugin(pluginName: string) {
    await this.save({
      plugins: {
        ...this._settings.plugins,
        enabled: this._settings.plugins.enabled.filter(p => p !== pluginName),
      }
    })
  }

  async enablePlugins(pluginNames: string[]) {
    await this.save({
      plugins: {
        ...this._settings.plugins,
        enabled: [...this._settings.plugins.enabled, ...pluginNames],
      }
    })
  }

  async getMeta(): Promise<SettingsMeta> {
    const errors = [];
    const files = [
      "starcraft",
      "maps",
      "replays",
      "assets",
      "plugins",
    ];

    for (const file of files) {
      if (!(await fileExists(this._settings.directories[file as keyof SettingsType["directories"]]))) {
        errors.push(`${file} directory is not a valid path. Please change your settings.json file to contain the valid path.`);
      }
    }

    const isCascStorage = await foldersExist(this._settings.directories["starcraft"], ["Data", "locales"]);
    if (!isCascStorage && !await foldersExist(this._settings.directories["starcraft"], ["anim", "arr"])) {
      if (await fileExists(path.join(this._settings.directories["starcraft"], "STARDAT.MPQ"))) {
        errors.push("The StarCraft directory is not a valid path. Your configuration might be pointing to StarCraft 1.16 version which is not supported. Go to Tools > Command Center and change the StarCraft directory to the correct one.");
      } else {
        errors.push("The StarCraft directory is not a valid path. Go to Tools > Command Center and change the StarCraft directory to the correct one.");
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

    const macros = sanitizeMacros(this._settings.macros, {
      data: this._settings,
      pluginsMetadata: getPluginsMetaData(),
    });

    return {
      data: { ...this._settings, macros },
      errors,
      isCascStorage,
      enabledPlugins: getEnabledPluginPackages(),
      disabledPlugins: getDisabledPluginPackages(),
      pluginsMetadata: getPluginsMetaData(),
      phrases: {
        ...phrases["en-US"],
        ...phrases[this._settings.language as keyof typeof phrases],
      },
    };
  }

  /**
   * Loads the settings.yml file from disk and parses the contents into a JS object.
   * Emits the "change" event.
   */
  async load(): Promise<SettingsType> {
    try {
      const contents = await fsPromises.readFile(this._filepath, {
        encoding: "utf8",
      });
      const json = JSON.parse(contents) as SettingsType;
      return json;
    } catch (e) {
      throw new Error(withErrorMessage(`@settings/load: Error loading settings.json from ${this._filepath}`, e));
    }
  }

  async loadAndMigrate() {
    try {
      const settings = await this.load();
      const [migrated, migratedSettings] = migrate(settings);
      if (migrated) {
        await this.save(migratedSettings);
        this._settings = { ...(await this.createDefaults()), ...migratedSettings };
      } else {
        this._settings = { ...(await this.createDefaults()), ...settings };
      }
    } catch (e) {
      log.error(withErrorMessage("@settings/load-and-migrate", e));
    }
  }

  /**
   * Saves the settings to disk. Will ignore any existing errors.
   * Emits the "change" event.
   * @param settings 
   */
  async save(settings: Partial<SettingsType>) {
    this._settings = Object.assign({}, this._settings, settings);
    this._settings.plugins.enabled = [...new Set(this._settings.plugins.enabled)];
    this._settings.macros = sanitizeMacros(this._settings.macros, {
      data: this._settings,
      pluginsMetadata: getPluginsMetaData(),
    });

    await fsPromises.writeFile(this._filepath, JSON.stringify(this._settings, null, 4), {
      encoding: "utf8",
    });
    return this._settings;
  }

  /**
   * Creates default settings for the user.
   * @returns a JS object with default settings
   */
  async createDefaults(): Promise<SettingsType> {

    const derivedSettings = {
      ...defaultSettings,
      language: supportedLanguages.find(s => s === String(getEnvLocale()))
        ??
        "en-US",
      directories: {
        starcraft: await findStarcraftPath(),
        maps: await findMapsPath(),
        replays: await findReplaysPath(),
        assets: app.getPath("documents"),
        plugins: await findPluginsPath(),
      }
    };
    return derivedSettings;
  }
}
