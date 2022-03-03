import { app } from "electron";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import { MathUtils } from "three";
import cheerio, { CheerioAPI } from "cheerio";

import phrases from "common/phrases";
import { defaultSettings } from "common/settings";
import fileExists from "common/utils/file-exists";
import { Settings as SettingsType, InitializedPluginConfiguration, AvailableLifecycles, ScreenType, ScreenStatus, ScreenData, InitializedPluginChannelConfiguration, SettingsMeta, PluginConfiguration } from "common/types";

import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";
import migrate from "./migrate";
import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import path from "path";
import logService from "../logger/singleton";

export const bootupLogs: LogMessage[] = [];
type LogMessage = {
  level: "info" | "warning" | "error" | "debug" | "verbose";
  message: string;
}

const log = {
  info: (message: string) => {
    logService.info(message);
    bootupLogs.push({ level: "info", message });
  },
  warning: (message: string) => {
    logService.warning(message);
    bootupLogs.push({ level: "warning", message });
  },
  error: (message: string) => {
    logService.error(message);
    bootupLogs.push({ level: "error", message });
  }
}

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
const screenDataMap = {
  "@home/ready": {
    type: ScreenType.Home,
    status: ScreenStatus.Ready,
  },
  "@replay/loading": {
    type: ScreenType.Replay,
    status: ScreenStatus.Loading,
  }, "@replay/ready": {
    type: ScreenType.Replay,
    status: ScreenStatus.Ready,
  }, "@map/loading": {
    type: ScreenType.Map,
    status: ScreenStatus.Loading,

  }, "@map/ready": {
    type: ScreenType.Map,
    status: ScreenStatus.Ready,
  }
} as Record<AvailableLifecycles, ScreenData>;

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};


let _pluginsConfigs: InitializedPluginConfiguration[];

/**
 * A settings management utility which saves and loads settings from a file.
 * It will also emit a "change" event whenever the settings are loaded or saved.
 */
export class Settings extends EventEmitter {
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

    this.loadPluginsConfiguration();
  }

  get() {
    return this._settings;
  }

  async _tryLoadUtf8(filepath: string, format: "json" | "text" | "xml" = "text"): Promise<any | null> {
    try {
      const content = await fsPromises.readFile(filepath, { encoding: "utf8" });
      if (format === 'json') {
        return JSON.parse(content);
      } else if (format === "xml") {
        return cheerio.load(content, { xmlMode: true });
      }
      return content;
    } catch (_) {
      return null;
    }
  }

  async loadPluginsConfiguration() {
    if (_pluginsConfigs) return;
    _pluginsConfigs = [];

    const defaultIndex = this._settings.plugins.slots.findIndex(slot => slot.name === "default");
    if (defaultIndex >= 0) {
      this._settings.plugins.slots.splice(defaultIndex, 1);
      log.warning("@settings/load-plugins: `default` slot is reserved.");
    }

    this._settings.plugins.slots.push({
      name: "default",
      direction: "none",
      overflow: "hidden",
      "layout.left": "0",
      "layout.top": "0",
      "layout.right": "0",
      "layout.bottom": "0",
    });

    let folders: ReadFolderResult[] = [];
    try {
      folders = await readFolder(this._settings.directories.plugins);
    } catch (_) {
      log.error(`@settings/load-plugins: Error reading plugins folder`);
    }

    const _pluginIds = new Set<string>();

    for (const folder of folders) {
      if (folder.isFolder) {
        const pluginJson = await this._tryLoadUtf8(path.join(folder.path, "plugin.json"), "json") as PluginConfiguration | null;
        const userConfig = await this._tryLoadUtf8(path.join(folder.path, "userConfig.json"), "json");
        const pluginHtml = await this._tryLoadUtf8(path.join(folder.path, "plugin.html"), "xml") as CheerioAPI | null;
        const pluginNative = await this._tryLoadUtf8(path.join(folder.path, "native.js")) as string | null;

        if (pluginJson) {

          if (!pluginJson) {
            log.error(`@settings/load-plugins: Error reading plugin.json file - ${folder.name}`);
            continue;
          }

          if (pluginJson.id === undefined) {
            log.error(`@settings/load-plugins: Undefined plugin id - ${folder.name}`);
            continue;
          }

          if (_pluginIds.has(pluginJson.id)) {
            log.error(`@settings/load-plugins: Duplicate plugin id - ${pluginJson.id}`);
            continue;
          }
          _pluginIds.add(pluginJson.id);

          if (!this._settings.plugins.enabled.includes(pluginJson.id)) {
            log.info(`@settings/load-plugins: ${pluginJson.id} is not enabled in settings, skipping.`);
            continue;
          }

          const pluginOut = pluginJson as unknown as InitializedPluginConfiguration;

          if (pluginNative) {
            pluginOut.nativeSource = pluginNative;
          }

          const channels: (InitializedPluginChannelConfiguration)[] = [];

          if (pluginHtml) {
            templateLoop:
            for (const template of pluginHtml('template')) {
              const channelKeys = (pluginHtml(template).attr("screen") ?? "").split(",").map(s => s.trim()).filter(s => s !== "");

              const screenDataKeys = Object.keys(screenDataMap);
              for (const key of channelKeys) {
                if (!screenDataKeys.includes(key)) {
                  log.error(`@settings/load-channel: channel ${channelKeys} is invalid, must be one of ${Object.keys(screenDataMap)}.`);
                  continue templateLoop;
                }
              }

              const screens = channelKeys.map(keys => screenDataMap[keys as keyof typeof screenDataMap]);

              const channel: InitializedPluginChannelConfiguration = {
                id: MathUtils.generateUUID(),
                position: pluginHtml(template).attr("position") ?? "",
                screens,
                style: pluginHtml("style", template).html()?.toString() ?? "",
                markup: pluginHtml("div", template).toString() ?? "",
                reactive: []
                //FIXME: remove need for reactive and parse markup instead
                // reactive: [...pluginHtml("store-subscribe", template)].map(reactive => pluginHtml(reactive).attr("value") ?? "").filter(Boolean),
              }

              // channel.url = url.startsWith("http") ? url : `http://localhost:${this._settings.plugins.serverPort}/${folder.name}/${url}`

              channels.push(channel);
            }
          }

          if (!pluginHtml && !pluginNative) {
            log.error(`@settings/load-plugins: plugin.html or native.js required - ${folder.name}`);
            continue;
          }

          pluginOut.channels = channels;
          pluginOut.userConfig = userConfig;

          _pluginsConfigs.push(pluginOut);
        }
      }

    }
  }
  /**
   * 
   * @returns a JS object with the current settings and metadata
   */
  async getMeta(): Promise<SettingsMeta> {
    //FIXME: use Error objects so we can contain and id as well as message
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
        errors.push(`${file} directory is not a valid path`);
      }
    }

    const isCascStorage = await foldersExist(this._settings.directories["starcraft"], ["Data", "locales"]);
    if (!isCascStorage && !await foldersExist(this._settings.directories["starcraft"], ["anim", "arr"])) {
      errors.push("starcraft directory is not a valid path");
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
      data: this._settings,
      errors,
      isCascStorage,
      pluginsConfigs: _pluginsConfigs,
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
    const contents = await fsPromises.readFile(this._filepath, {
      encoding: "utf8",
    });
    return JSON.parse(contents) as SettingsType;
  }

  async loadAndMigrate() {
    const settings = await this.load();
    const [migrated, migratedSettings] = migrate(settings);
    if (migrated) {
      await this.save(migratedSettings);
      this._settings = { ...(await this.createDefaults()), ...migratedSettings };
    } else {
      this._settings = { ...(await this.createDefaults()), ...settings };
    }
    this._emitChanged();
  }

  /**
   * Saves the settings to disk. Will ignore any existing errors.
   * Emits the "change" event.
   * @param settings 
   */
  async save(settings: any) {
    if (settings.errors) {
      delete settings.errors;
    }

    this._settings = Object.assign({}, this._settings, settings);
    await fsPromises.writeFile(this._filepath, JSON.stringify(this._settings, null, 4), {
      encoding: "utf8",
    });
    this._emitChanged();
  }

  async _emitChanged() {
    this.emit("change", await this.getMeta());
  }

  /**
   * Creates default settings for the user.
   * @returns a JS object with default settings
   */
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
        assets: app.getPath("documents"),
        plugins: path.join(__static, "plugins")
      }
    };
  }
}
