import PackageJson from '@npmcli/package-json';
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";
import { shell } from 'electron';
import pacote from "pacote";
import sanitizeFilename from "sanitize-filename";

import { InitializedPluginPackage } from "common/types";
import { ON_PLUGIN_CONFIG_UPDATED, ON_PLUGIN_ENABLED } from "common/ipc-handle-names";

import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import logService from "../logger/singleton";
import browserWindows from "../windows";
import settings from "../settings/singleton"
import withErrorMessage from 'common/utils/with-error-message';


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


let _pluginsConfigs: InitializedPluginPackage[];
let _disabledPluginConfigs: InitializedPluginPackage[];

export const getEnabledPluginConfigs = () => _pluginsConfigs;
export const getDisabledPluginConfigs = () => _disabledPluginConfigs;

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
    const pluginNative = await _tryLoadUtf8(path.join(folderPath, "native.js")) as string | null;

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
        config: packageJSON.config,
        nativeSource: pluginNative
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
        if (settings.get().plugins.enabled.includes(plugin.name)) {
            _pluginsConfigs.push(plugin);
        } else {
            _disabledPluginConfigs.push(plugin);
        }
    }
}

export default async (pluginDirectory: string) => {
    if (_pluginsConfigs) return;
    _pluginsConfigs = [];
    _disabledPluginConfigs = [];
    _pluginDirectory = pluginDirectory;

    try {
        await loadPluginPackages(await readFolder(pluginDirectory));
    } catch (e) {
        log.error(withErrorMessage(`@load-plugins/default: Error loading plugins`, e));
    }

}


export const installPlugin = async (repository: string) => {
    log.info(`@load-plugins/install: Installing plugin ${repository}`);

    try {

        const manifest = await pacote.manifest(repository);
        const folderName = sanitizeFilename(manifest.name);
        const folderPath = path.join(_pluginDirectory, folderName);
        await pacote.extract(repository, folderPath);

        try {
            const loadedPackage = await loadPluginPackage(folderPath, folderName);
            if (loadedPackage) {
                _disabledPluginConfigs.push(loadedPackage);
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

export const enablePlugin = (pluginId: string) => {
    const plugin = _disabledPluginConfigs.find(p => p.id === pluginId);
    if (!plugin) {
        log.info(`@load-plugins/enable: Plugin ${pluginId} not found`);
        return;
    };

    log.info(`@load-plugins/enable: Enabling plugin ${plugin.name}`);

    try {
        settings.enablePlugin(plugin.name);
        _disabledPluginConfigs = _disabledPluginConfigs.filter(otherPlugin => otherPlugin !== plugin);
        _pluginsConfigs.push(plugin);
        browserWindows.main?.webContents.send(ON_PLUGIN_ENABLED, plugin);
        return true;
    } catch (e) {
        log.info(`@load-plugins/enable: Error enabling plugin ${plugin.name}`);
    }

}

// note: requires restart for user to see changes
export const disablePlugin = (pluginId: string) => {
    const plugin = _pluginsConfigs.find(p => p.id === pluginId);
    if (!plugin) {
        log.info(`@load-plugins/disable: Plugin ${pluginId} not found`);
        return false;
    };

    log.info(`@load-plugins/disable: Disabling plugin ${plugin.name}`);

    try {
        settings.disablePlugin(plugin.name);
        _pluginsConfigs = _pluginsConfigs.filter(otherPlugin => otherPlugin !== plugin);
        _disabledPluginConfigs.push(plugin);
        return true;
    } catch {
        log.info(`@load-plugins/disable: Error disabling plugin ${plugin.name}`);
        return false;
    }
}

// note: requires restart for user to see changes
export const uninstallPlugin = async (pluginId: string) => {
    const plugin = _disabledPluginConfigs.find(p => p.id === pluginId);
    if (!plugin) {
        log.error(`@load-plugins/uninstall: Plugin ${pluginId} not found`);
        return;
    };

    log.info(`@load-plugins/uninstall: Uninstalling plugin ${plugin.name}`);

    const delPath = path.join(_pluginDirectory, plugin.path);
    try {
        shell.trashItem(delPath);
        _disabledPluginConfigs = _disabledPluginConfigs.filter(otherPlugin => otherPlugin.id !== pluginId);
    } catch {
        log.error(`@load-plugins/uninstall: Failed to delete plugin ${plugin.name} on folder ${delPath}`);
        return false;
    }
    return true;
}



export const savePluginsConfig = async (pluginDirectory: string, pluginId: string, config: any) => {
    const pluginConfig = _pluginsConfigs.find(p => p.id === pluginId);
    if (!pluginConfig) {
        log.error(`@settings/load-plugins: Could not find plugin with id ${pluginId}`);
        return;
    }

    const existingConfigPath = path.join(pluginDirectory, pluginConfig.path);

    let pkgJson;

    try {
        pkgJson = await PackageJson.load(existingConfigPath)
    } catch (e) {
        log.error(`@save-plugins-config: Error reading plugin package.json`);
        return;
    }

    pluginConfig.config = config;
    pkgJson.update({
        config
    })

    try {
        await pkgJson.save()
    } catch (e) {
        log.error(`@save-plugins-config: Error writing plugin package.json`);
        return;
    }

    browserWindows.main?.webContents.send(ON_PLUGIN_CONFIG_UPDATED, pluginId, config);
}