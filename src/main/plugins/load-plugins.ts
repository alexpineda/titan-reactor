import PackageJson from '@npmcli/package-json';
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";
import { app, shell } from 'electron';
import pacote from "pacote";
import sanitizeFilename from "sanitize-filename";
import deepMerge from "deepmerge"
import semver from 'semver';

import { InitializedPluginPackage } from "common/types";
import { ON_PLUGIN_CONFIG_UPDATED, ON_PLUGINS_ENABLED, RELOAD_PLUGINS, DISABLE_PLUGIN, ON_PLUGINS_INITIAL_INSTALL_ERROR, ON_PLUGINS_INITIAL_INSTALL } from "common/ipc-handle-names";

import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import browserWindows from "../windows";
import settings from "../settings/singleton"
import withErrorMessage from 'common/utils/with-error-message';
import log from "../log"
import fileExists from 'common/utils/file-exists';
import packagejson from "../../../package.json";

const _builtInsPath = path.resolve(__static, "plugins-runtime", "builtins");
const _builtInPlugins: string[] = [];

let _enabledPluginPackages: InitializedPluginPackage[];
let _disabledPluginPackages: InitializedPluginPackage[];

export const getEnabledPluginConfigs = () => _enabledPluginPackages;
export const getDisabledPluginConfigs = () => _disabledPluginPackages;

const PLUGIN_ID_MACRO = "_plugin_id_";

export const replacePluginContent = (content: string, pluginId: string) => {
    return content.replace(new RegExp(PLUGIN_ID_MACRO, "g"), pluginId);
}

const _tryLoadUtf8 = async (filepath: string, format: "json" | "text" | "xml" = "text"): Promise<any | null> => {
    try {
        const content = await fsPromises.readFile(filepath, { encoding: "utf8" });
        if (format === 'json') {
            return JSON.parse(content);
        }
        return content;
    } catch (_) {
        return null;
    }
}

let _pluginDirectory = "";

const loadPluginPackage = async (folderPath: string, folderName: string): Promise<null | InitializedPluginPackage> => {

    const packageJSON = await _tryLoadUtf8(path.join(folderPath, "package.json"), "json");
    const pluginNative = await _tryLoadUtf8(path.join(folderPath, "plugin.js")) as string | null;
    const readme = await _tryLoadUtf8(path.join(folderPath, "readme.md")) as string | null;
    const hasUI = await fileExists(path.join(folderPath, "index.jsx"));

    if (!packageJSON) {
        return null
    }

    if (packageJSON.name === undefined) {
        log.error(`@load-plugins/load-configs: Undefined plugin name - ${folderName}`);
        return null;
    }

    if (packageJSON.version === undefined) {
        log.error(`@load-plugins/load-configs: Undefined plugin version - ${folderName}`);
        return null;
    }

    return {
        id: MathUtils.generateUUID(),
        name: packageJSON.name,
        version: packageJSON.version,
        description: packageJSON.description,
        author: packageJSON.author,
        repository: packageJSON.repository,
        path: folderName,
        config: packageJSON.config ?? {},
        nativeSource: pluginNative,
        readme: readme ?? undefined,
        hasUI
    };

}

const loadPluginPackages = async (folders: ReadFolderResult[]) => {
    for (const folder of folders) {
        if (!folder.isFolder) {
            return null;
        }
        const plugin = await loadPluginPackage(folder.path, folder.name);
        if (plugin === null) {
            continue;
        }

        const titanReactorApiVersion = packagejson.config["titan-reactor-api"];
        const pluginApiVersion = plugin.peerDependencies?.["titan-reactor-api"] ?? "1.0.0";

        //TODO: disable plugin in settings if version is not compatible
        if (semver.major(titanReactorApiVersion) <
            semver.major(pluginApiVersion)) {
            log.error(
                `@load-plugins/load-plugin-packages: Plugin ${plugin.name} requires Titan Reactor API version ${pluginApiVersion} but the current version is ${titanReactorApiVersion}`
            );
        }

        if (settings.get().plugins.enabled.includes(plugin.name)) {
            _enabledPluginPackages.push(plugin);
        } else {
            _disabledPluginPackages.push(plugin);
        }
    }
}

const DEFAULT_PACKAGES: string[] = [
    "@titan-reactor-plugins/global-settings",
    "@titan-reactor-plugins/clock",
    "@titan-reactor-plugins/default-screens",
    "@titan-reactor-plugins/player-colors",
    "@titan-reactor-plugins/replay-control",
    "@titan-reactor-plugins/camera-default",
    "@titan-reactor-plugins/camera-overview",
    "@titan-reactor-plugins/camera-battle",
    "@titan-reactor-plugins/players-bar",
    "@titan-reactor-plugins/recently-dead",
    "@titan-reactor-plugins/chat-display",
    "@titan-reactor-plugins/unit-selection-display",
    "@titan-reactor-plugins/production-bar"
];


export default async (pluginDirectory: string) => {
    _enabledPluginPackages = [];
    _disabledPluginPackages = [];
    _pluginDirectory = pluginDirectory;

    try {
        const folders = [...(await readFolder(_builtInsPath)), ...(await readFolder(pluginDirectory))];
        await loadPluginPackages(folders);

        if (_enabledPluginPackages.length === 0 && _disabledPluginPackages.length === 0) {
            browserWindows.main?.webContents.send(ON_PLUGINS_INITIAL_INSTALL);
            const enablePluginIds = [];

            enablePluginIds.push(..._builtInPlugins);
            for (const defaultPackage of DEFAULT_PACKAGES) {
                const plugin = await installPlugin(defaultPackage);
                if (plugin) {
                    enablePluginIds.push(plugin.name);
                } else {
                    log.error(`@load-plugins/default: Failed to install default plugin ${defaultPackage}`);
                }
            }
            await settings.enablePlugins(enablePluginIds);
            if (enablePluginIds.length > 0) {
                app.relaunch();
                app.exit();
            } else {
                log.error(`@load-plugins/default: Failed to install default plugins`);
                browserWindows.main?.webContents.send(ON_PLUGINS_INITIAL_INSTALL_ERROR);
            }

        }
    } catch (e) {
        log.error(withErrorMessage(`@load-plugins/default: Error loading plugins`, e));
    }

}


export const installPlugin = async (repository: string) => {
    log.info(`@load-plugins/install: Installing plugin ${repository}`);

    try {

        const manifest = await pacote.manifest(repository);
        const folderName = sanitizeFilename(manifest.name.replace("/", "_"));
        const folderPath = path.join(_pluginDirectory, folderName);

        await pacote.extract(repository, folderPath);

        try {
            const loadedPackage = await loadPluginPackage(folderPath, folderName);

            if (loadedPackage) {
                const enabledPlugin = _enabledPluginPackages.find(p => p.name === loadedPackage.name);
                // if  a plugin is enabled, it means we're updating since the update function is only available
                // when the plugin is enabled
                if (enabledPlugin) {
                    const oldConfig = enabledPlugin.config;
                    _enabledPluginPackages.splice(_enabledPluginPackages.indexOf(enabledPlugin), 1, loadedPackage);
                    savePluginsConfig(loadedPackage.id, oldConfig, false);
                    browserWindows.main?.webContents.send(RELOAD_PLUGINS);
                    browserWindows.config?.webContents.reloadIgnoringCache();

                    //TODO: if plugin has native.js, requires full app restart
                }
                // otherwise this is a fresh install in which plugins get placed in the disabled plugins list
                else {
                    _disabledPluginPackages.push(loadedPackage);
                }
            }
            return loadedPackage;
        } catch (e) {
            log.error(withErrorMessage(`@load-plugins/default: Error loading plugins`, e));
        }

    } catch (e) {
        log.error(withErrorMessage(`@load-plugins/default: Error loading plugin ${repository}`, e));
    }

    return null;
}

export const enablePlugins = async (pluginIds: string[]) => {
    const plugins = pluginIds.map(pluginId => {
        const plugin = _disabledPluginPackages.find(plugin => plugin.id === pluginId);
        if (!plugin) {
            log.info(`@load-plugins/enable: Plugin ${pluginId} not found`);
        };
        return plugin;
    }).filter(plugin => plugin !== undefined) as InitializedPluginPackage[];

    try {
        await settings.enablePlugins(plugins.map(plugin => plugin.name));
        _disabledPluginPackages = _disabledPluginPackages.filter(otherPlugin => !plugins.includes(otherPlugin));
        _enabledPluginPackages.push(...plugins);
        browserWindows.main?.webContents.send(ON_PLUGINS_ENABLED, plugins);
        browserWindows.config?.reload();
        return true;
    } catch (e) {
        log.info(`@load-plugins/enable: Error enabling plugins ${plugins.map(plugin => plugin.name).join(", ")}`);
    }

};

// note: requires restart for user to see changes
export const disablePlugin = async (pluginId: string) => {
    const plugin = _enabledPluginPackages.find(p => p.id === pluginId);
    if (!plugin) {
        log.info(`@load-plugins/disable: Plugin ${pluginId} not found`);
        return false;
    };

    log.info(`@load-plugins/disable: Disabling plugin ${plugin.name}`);

    try {
        await settings.disablePlugin(plugin.name);
        _enabledPluginPackages = _enabledPluginPackages.filter(otherPlugin => otherPlugin !== plugin);
        _disabledPluginPackages.push(plugin);
        browserWindows.main?.webContents.send(DISABLE_PLUGIN, plugin.id);
        return true;
    } catch {
        log.info(`@load-plugins/disable: Error disabling plugin ${plugin.name}`);
        return false;
    }
}

// note: requires restart for user to see changes
export const uninstallPlugin = async (pluginId: string) => {
    const plugin = _disabledPluginPackages.find(p => p.id === pluginId);
    if (!plugin) {
        log.error(`@load-plugins/uninstall: Plugin ${pluginId} not found`);
        return;
    };

    log.info(`@load-plugins/uninstall: Uninstalling plugin ${plugin.name}`);

    const delPath = path.join(_pluginDirectory, plugin.path);
    try {
        shell.trashItem(delPath);
        _disabledPluginPackages = _disabledPluginPackages.filter(otherPlugin => otherPlugin.id !== pluginId);
    } catch {
        log.error(`@load-plugins/uninstall: Failed to delete plugin ${plugin.name} on folder ${delPath}`);
        return false;
    }
    return true;
}



export const savePluginsConfig = async (pluginId: string, config: any, updateMainWindow = true) => {
    const pluginConfig = _enabledPluginPackages.find(p => p.id === pluginId);
    if (!pluginConfig) {
        log.error(`@settings/load-plugins: Could not find plugin with id ${pluginId}`);
        return;
    }

    const existingConfigPath = path.join(_pluginDirectory, pluginConfig.path);

    try {
        const pkgJson = await PackageJson.load(existingConfigPath);
        const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

        if (pluginConfig.config) {
            pluginConfig.config = deepMerge(pluginConfig.config, config, { arrayMerge: overwriteMerge });
        } else {
            pluginConfig.config = config;
        }

        pkgJson.update({
            config
        })
        await pkgJson.save()
    } catch (e) {
        log.error(withErrorMessage(`@save-plugins-config: Error writing plugin package.json`, e));
        return;
    }

    if (updateMainWindow) {
        browserWindows.main?.webContents.send(ON_PLUGIN_CONFIG_UPDATED, pluginId, config);
    }
}