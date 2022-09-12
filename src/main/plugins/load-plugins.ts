import PackageJson from '@npmcli/package-json';
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";
import { app, dialog, shell } from 'electron';
import pacote from "pacote";
import sanitizeFilename from "sanitize-filename";
import deepMerge from "deepmerge"
import semver from 'semver';

import { PluginMetaData, PluginPackage } from "common/types";
import { ON_PLUGINS_ENABLED, RELOAD_PLUGINS, DISABLE_PLUGIN, ON_PLUGINS_INITIAL_INSTALL_ERROR, ON_PLUGINS_INITIAL_INSTALL } from "common/ipc-handle-names";

import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import browserWindows from "../windows";
import settings from "../settings/singleton"
import withErrorMessage from 'common/utils/with-error-message';
import log from "../log"
import fileExists from 'common/utils/file-exists';
import packagejson from "../../../package.json";
import { transpile } from '../transpile';

let _enabledPluginPackages: PluginMetaData[] = [];
let _disabledPluginPackages: PluginMetaData[] = [];

export const getEnabledPluginPackages = () => _enabledPluginPackages;
export const getDisabledPluginPackages = () => _disabledPluginPackages;

const loadUtf8 = async (filepath: string, format: "json" | "text" | "xml" = "text"): Promise<{}> => {
    const content = await fsPromises.readFile(filepath, { encoding: "utf8" });
    if (format === 'json') {
        return JSON.parse(content);
    }
    return content;
}

const tryLoadUtf8 = async (filepath: string, format: "json" | "text" | "xml" = "text"): Promise<any | null> => {
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

const loadPluginPackage = async (folderPath: string, folderName: string): Promise<null | PluginMetaData> => {

    if (!await fileExists(path.join(folderPath, "package.json"))) {
        log.error(`@load-plugins/load-plugin-packages: package.json missing - ${folderName}`);
        return null
    }
    const packageJSON = await loadUtf8(path.join(folderPath, "package.json"), "json") as PluginPackage;
    let pluginNative = null;
    if (await fileExists(path.join(folderPath, "plugin.ts"))) {
        const tsSource = await tryLoadUtf8(path.join(folderPath, "plugin.ts")) as string | null;
        if (tsSource) {
            try {
                const result = transpile(tsSource, path.join(folderPath, "plugin.ts"), true);
                if (result.transpileErrors.length) {
                    log.error(`@load-plugins/load-plugin-packages: Plugin ${folderName} transpilation errors: ${result.transpileErrors[0].message} ${result.transpileErrors[0].snippet}`);
                    return null;
                }
                pluginNative = result.result.outputText;
            } catch (e) {
                log.error(withErrorMessage(`@load-plugins/load-plugin-package: Plugin ${folderName} transpilation error`, e));
                return null;
            }
        }
    } else if (await fileExists(path.join(folderPath, "plugin.js"))) {
        pluginNative = await tryLoadUtf8(path.join(folderPath, "plugin.js")) as string | null;
        if (pluginNative === null) {
            log.error(`@load-plugins/load-plugin-packages: Plugin ${folderName} failed to load plugin.js`);
            return null;
        }
    }
    const readme = await tryLoadUtf8(path.join(folderPath, "readme.md")) as string | null;

    let indexFile = "";
    if (await fileExists(path.join(folderPath, "index.jsx"))) {
        indexFile = "index.jsx";
    } else if (await fileExists(path.join(folderPath, "index.tsx"))) {
        indexFile = "index.tsx";
    }

    if (packageJSON.name === undefined) {
        log.error(`@load-plugins/load-configs: Undefined plugin name - ${folderName}`);
        return null;
    }

    if (packageJSON.version === undefined) {
        log.error(`@load-plugins/load-configs: Undefined plugin version - ${folderName}`);
        return null;
    }

    const config = packageJSON.config ?? {};
    if (typeof config._visible !== "object") {
        if (indexFile) {
            Object.assign(config, { _visible: { value: true, label: "UI Visible", folder: "System" } });
        } else {
            delete config._visible;
        }
    }

    return {
        id: MathUtils.generateUUID(),
        name: packageJSON.name,
        version: packageJSON.version,
        description: packageJSON.description,
        author: packageJSON.author,
        repository: packageJSON.repository,
        keywords: packageJSON.keywords ?? [],
        apiVersion: packageJSON.peerDependencies?.["titan-reactor-api"] ?? "1.0.0",
        path: folderName,
        config,
        nativeSource: pluginNative,
        readme: readme ?? undefined,
        indexFile,
        externMethods: getExternMethods(pluginNative ?? ""),
        isSceneController: (pluginNative ?? "").includes("onEnterScene"),
        hooks: packageJSON.config?.system?.customHooks ?? [],
    };

}

const loadPluginPackages = async (folders: ReadFolderResult[]) => {
    let _saveChangesToSettings = false;

    for (const folder of folders) {
        if (!folder.isFolder) {
            continue;
        }
        const plugin = await loadPluginPackage(folder.path, folder.name);
        if (plugin === null) {
            continue;
        }

        const titanReactorApiVersion = packagejson.config["titan-reactor-api"];
        const pluginIsAlreadyEnabled = settings.get().plugins.enabled.includes(plugin.name);

        if (pluginIsAlreadyEnabled && semver.major(titanReactorApiVersion) !==
            semver.major(plugin.apiVersion)) {
            log.error(
                `@load-plugins/load-plugin-packages: Plugin ${plugin.name} requires Titan Reactor API version ${plugin.apiVersion} but the current version is ${titanReactorApiVersion}`
            );
            _disabledPluginPackages.push(plugin);
            _saveChangesToSettings = true;
        } else if (pluginIsAlreadyEnabled) {
            _enabledPluginPackages.push(plugin);
        } else {
            _disabledPluginPackages.push(plugin);
        }
    }

    if (_saveChangesToSettings) {
        await settings.disablePlugins(_disabledPluginPackages.map(p => p.name));
    }
}

const DEFAULT_PACKAGES: string[] = [
    "@titan-reactor-plugins/clock",
    "@titan-reactor-plugins/player-colors",
    "@titan-reactor-plugins/camera-standard",
    "@titan-reactor-plugins/camera-overview",
    "@titan-reactor-plugins/camera-battle",
    "@titan-reactor-plugins/players-bar",
    "@titan-reactor-plugins/unit-selection-display",
    "@titan-reactor-plugins/production-bar",
    "@titan-reactor-plugins/unit-sounds",
];

export default async (pluginDirectory: string) => {
    _enabledPluginPackages = [];
    _disabledPluginPackages = [];
    _pluginDirectory = pluginDirectory;

    try {
        const folders = await readFolder(pluginDirectory);
        await loadPluginPackages(folders);

        if (_enabledPluginPackages.length === 0 && _disabledPluginPackages.length === 0) {
            setTimeout(() => {
                browserWindows.main?.webContents.send(ON_PLUGINS_INITIAL_INSTALL);
            }, 200);
            const enablePluginIds = [];

            for (const defaultPackage of DEFAULT_PACKAGES) {
                const plugin = await installPlugin(defaultPackage);
                browserWindows.main?.webContents.send(ON_PLUGINS_INITIAL_INSTALL);
                if (plugin) {
                    enablePluginIds.push(plugin.name);
                } else {
                    log.error(`@load-plugins/default: Failed to install default plugin ${defaultPackage}`);
                }
            }
            await settings.enablePlugins(enablePluginIds);
            if (enablePluginIds.length > 0) {
                dialog.showMessageBoxSync({ message: "Plugins successfully installed. Restarting..." });
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
    log.info(`@load-plugins/install-plugin: Installing plugin ${repository}`);

    try {

        const manifest = await pacote.manifest(repository);
        const folderName = sanitizeFilename(manifest.name.replace("/", "_"));
        const folderPath = path.join(_pluginDirectory, folderName);

        await pacote.extract(repository, folderPath);

        try {
            const loadedPackage = await loadPluginPackage(folderPath, folderName);

            if (loadedPackage) {
                const pluginToUpdate = _enabledPluginPackages.find(p => p.name === loadedPackage.name);
                // we are not only installing but also updating this package
                if (pluginToUpdate) {
                    const oldConfig = pluginToUpdate.config;
                    _enabledPluginPackages.splice(_enabledPluginPackages.indexOf(pluginToUpdate), 1, loadedPackage);
                    savePluginConfig(loadedPackage.id, oldConfig);
                    browserWindows.main?.webContents.send(RELOAD_PLUGINS);
                    browserWindows.config?.webContents.reloadIgnoringCache();
                }
                // otherwise this is a fresh install in which plugins get placed in the disabled plugins list
                else {
                    _disabledPluginPackages.push(loadedPackage);
                }
            }
            return loadedPackage;
        } catch (e) {
            log.error(withErrorMessage(`@load-plugins/install-plugin: Error loading plugins`, e));
        }

    } catch (e) {
        log.error(withErrorMessage(`@load-plugins/install-plugin: Error loading plugin ${repository}`, e));
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
    }).filter(plugin => plugin !== undefined) as PluginMetaData[];

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

export const disablePlugin = async (pluginId: string) => {
    const plugin = _enabledPluginPackages.find(p => p.id === pluginId);
    if (!plugin) {
        log.info(`@load-plugins/disable: Plugin ${pluginId} not found`);
        return false;
    };

    log.info(`@load-plugins/disable: Disabling plugin ${plugin.name}`);

    try {
        await settings.disablePlugins([plugin.name]);
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

export const savePluginConfig = async (pluginId: string, config: any) => {
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
}

const getExternMethods = (fn: string) => {
    const regex = /(externMethod([a-zA-Z0-9_$]+))+/g
    const matches = fn.match(regex);
    if (matches) {
        return [...new Set(matches)];
    } else {
        return [];
    }
}
