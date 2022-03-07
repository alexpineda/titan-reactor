import { InitializedPluginPackage } from "common/types";
import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import path from "path";
import logService from "../logger/singleton";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";


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

export const getPluginConfigs = () => _pluginsConfigs;

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


export default async (pluginDirectory: string, enabledPluginIds: string[]) => {
    if (_pluginsConfigs) return;
    _pluginsConfigs = [];

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

                if (!enabledPluginIds.includes(packageJSON.name)) {
                    log.info(`@settings/load-plugins: ${packageJSON.name} is not enabled in settings, skipping.`);
                    continue;
                }

                _pluginsConfigs.push({
                    id: pluginId,
                    name: packageJSON.name,
                    version: packageJSON.version,
                    description: packageJSON.description,
                    author: packageJSON.author,
                    path: folder.name,
                    config: packageJSON.config,
                    nativeSource: pluginNative
                });
            }
        }

    }
}