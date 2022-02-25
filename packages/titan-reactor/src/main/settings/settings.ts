import { app } from "electron";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";

import phrases from "../../common/phrases";
import { defaultSettings } from "../../common/settings";
import fileExists from "../../common/utils/file-exists";
import { Settings as SettingsType, InitializedPluginConfiguration, AvailableLifecycles, PluginConfiguration, ScreenType, ScreenStatus, InitializedPluginChannelConfiguration, PluginChannelConfigurationBase } from "../../common/types";
import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";
import { SettingsMeta } from "../../common/types";
import migrate from "./migrate";
import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import path from "path";
import log from "../logger/singleton";
import { isIFrameChannelConfig, isWorkerChannelConfig } from "../../common/utils/plugins";
import browserWindows from "main/windows";
import { LOG_MESSAGE } from "common";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
const screenDataMap = {
  "@home/ready": {
    screenType: ScreenType.Home,
    screenStatus: ScreenStatus.Ready,
  },
  "@replay/loading": {
    screenType: ScreenType.Replay,
    screenStatus: ScreenStatus.Loading,
  }, "@replay/ready": {
    screenType: ScreenType.Replay,
    screenStatus: ScreenStatus.Ready,

  }, "@map/loading": {
    screenType: ScreenType.Map,
    screenStatus: ScreenStatus.Loading,

  }, "@map/ready": {
    screenType: ScreenType.Map,
    screenStatus: ScreenStatus.Ready,
  }
} as Record<AvailableLifecycles, { screenType: ScreenType, screenStatus: ScreenStatus }>;

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
    browserWindows.main?.webContents.send(LOG_MESSAGE, "@settings/initialize: hello world", "info");

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

  async loadPluginsConfiguration() {
    if (_pluginsConfigs) return;
    _pluginsConfigs = [];

    const defaultIndex = this._settings.plugins.slots.findIndex(slot => slot.name === "default");
    if (defaultIndex >= 0) {
      this._settings.plugins.slots.splice(defaultIndex, 1);
      log.warn("@settings/load-plugins: `default` slot is reserved.");
      browserWindows.main?.webContents.send(LOG_MESSAGE, "@settings/load-plugins: `default` slot is reserved.", "warn");
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

    for (const folder of folders) {
      if (folder.isFolder) {
        const filePath = path.join(folder.path, "plugin.json");
        if (await fileExists(filePath)) {
          let pluginConfig: PluginConfiguration;

          try {
            const contents = await fsPromises.readFile(filePath, { encoding: "utf8" });
            pluginConfig = JSON.parse(contents) as PluginConfiguration;
          } catch (_) {
            log.error(`@settings/load-plugins: Error reading plugin.json file - ${filePath}`);
            continue;
          }

          if (!this._settings.plugins.enabled.includes(folder.name)) {
            log.info(`@settings/load-plugins: ${folder.name} is not enabled, skipping.`);
            continue;
          }

          const pluginOut = pluginConfig as unknown as InitializedPluginConfiguration;

          const importfilePath = path.join(folder.path, "native.js");
          if (await fileExists(importfilePath)) {
            try {
              pluginOut.nativeSource = await fsPromises.readFile(importfilePath, { encoding: "utf8" });
            } catch (e) {
              log.error("@settings/load-plugins: native source file failed to load.");
              continue;
            }
          }

          const extraStylesheet = path.join(folder.path, "component.css");
          if (await fileExists(extraStylesheet)) {
            try {
              pluginOut.extraStylesheet = await fsPromises.readFile(extraStylesheet, { encoding: "utf8" });
            } catch (e) {
              log.error(`@settings/load-extra: component stylesheet failed to load ${extraStylesheet}.`);
            }
          }

          const channels: (InitializedPluginChannelConfiguration<PluginChannelConfigurationBase>)[] = [];

          for (const channelKey in pluginConfig.channels) {
            if (!Object.keys(screenDataMap).includes(channelKey)) {
              log.error(`@settings/load-channel: channel ${channelKey} is invalid, must be one of ${Object.keys(screenDataMap)}.`);
              continue;
            }
            const channelsConfig = pluginConfig.channels[channelKey as AvailableLifecycles];
            for (const channel of channelsConfig) {
              const url = channel.url ?? (isWorkerChannelConfig(channel) ? pluginConfig.worker?.url : (isIFrameChannelConfig(channel) ? pluginConfig.iframe?.url : pluginConfig.webComponent?.url));

              if (!url) {
                log.error(`@settings/load-channel: channel url is missing - ${folder.name}`);
                continue;
              }

              channel.url = url.startsWith("http") ? url : `http://localhost:${this._settings.plugins.serverPort}/${folder.name}/${url}`

              if (isIFrameChannelConfig(channel) && channel["layout.slot"] === undefined) {
                channel["layout.slot"] = "default";
              }

              channels.push({
                ...channel,
                ...screenDataMap[channelKey as AvailableLifecycles]
              } as InitializedPluginChannelConfiguration<PluginChannelConfigurationBase>);
            }
          }

          pluginOut.channels = channels;
          pluginOut.tag = folder.name;

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
