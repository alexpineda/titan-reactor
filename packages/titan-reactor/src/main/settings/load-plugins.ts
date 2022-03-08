import PackageJson from '@npmcli/package-json';
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";

import { InitializedPluginPackage } from "common/types";
import { UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";

import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import logService from "../logger/singleton";
import browserWindows from "../windows";
import settings from "../settings/singleton"
import { shell } from 'electron';

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

export default async (pluginDirectory: string, enabledPluginNames: string[]) => {
    if (_pluginsConfigs) return;
    _pluginsConfigs = [];
    _disabledPluginConfigs = [];
    _pluginDirectory = pluginDirectory;

    let folders: ReadFolderResult[] = [];
    try {
        folders = await readFolder(pluginDirectory);
    } catch {
        log.error(`@settings/load-plugins: Error reading plugins folder`);
    }

    for (const folder of folders) {
        if (folder.isFolder) {
            const packageJSON = await _tryLoadUtf8(path.join(folder.path, "package.json"), "json");
            const pluginNative = await _tryLoadUtf8(path.join(folder.path, "native.js")) as string | null;

            if (packageJSON) {

                const pluginId = MathUtils.generateUUID();

                if (packageJSON.name === undefined) {
                    log.error(`@settings/load-plugins: Undefined plugin name - ${folder.name}`);
                    continue;
                }

                if (packageJSON.version === undefined) {
                    log.error(`@settings/load-plugins: Undefined plugin version - ${folder.name}`);
                    continue;
                }

                const plugin = {
                    id: pluginId,
                    name: packageJSON.name,
                    version: packageJSON.version,
                    description: packageJSON.description,
                    author: packageJSON.author,
                    repository: packageJSON.repository,
                    path: folder.name,
                    config: packageJSON.config,
                    nativeSource: pluginNative
                };

                if (enabledPluginNames.includes(packageJSON.name)) {
                    _pluginsConfigs.push(plugin);
                } else {
                    _disabledPluginConfigs.push(plugin);
                }
            }
        }

    }
}


export const installPlugin = (repository: string) => {
    console.log(`@settings/load-plugins: Enabling plugin ${repository}`);

    return false;

}
export const enablePlugin = (pluginId: string) => {
    console.log(`@settings/load-plugins: Enabling plugin ${pluginId}`);
}

// note: requires restart for user to see changes
export const disablePlugin = (pluginId: string) => {
    const plugin = _pluginsConfigs.find(p => p.id === pluginId);
    if (!plugin) {
        log.info(`@load-plugins/disable: Plugin ${pluginId} not found`);
        return;
    };

    log.info(`@load-plugins/disable: Disabling plugin ${pluginId}`);
    _pluginsConfigs = _pluginsConfigs.filter(plugin => plugin !== plugin);
    _disabledPluginConfigs.push(plugin);

    settings.disablePlugin(plugin.name);

    return true;
}

// note: requires restart for user to see changes
export const uninstallPlugin = async (pluginId: string) => {
    const plugin = _disabledPluginConfigs.find(p => p.id === pluginId);
    if (!plugin) {
        log.error(`@load-plugins/uninstall: Plugin ${pluginId} not found`);
        return;
    };

    log.info(`@load-plugins/uninstall: Uninstalling plugin ${pluginId}`);
    _disabledPluginConfigs = _disabledPluginConfigs.filter(plugin => plugin !== plugin);

    const delPath = path.join(_pluginDirectory, plugin.path);
    try {
        shell.trashItem(delPath);
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
        console.error(`@save-plugins-config: Error reading plugin package.json`);
        return;
    }


    pluginConfig.config = config;
    pkgJson.update({
        config
    })


    try {
        await pkgJson.save()
        //   await fsPromises.writeFile(existingConfigPath, JSON.stringify(existingConfig, null, 4));
    } catch (e) {
        console.error(`@save-plugins-config: Error writing plugin package.json`);
        return;
    }

    // main window needs to update the iframe plugins
    browserWindows.main?.webContents.send(UPDATE_PLUGIN_CONFIG, pluginId, config);
}