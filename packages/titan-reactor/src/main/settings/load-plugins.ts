import cheerio, { CheerioAPI } from "cheerio";

import { InitializedPluginConfiguration, AvailableLifecycles, ScreenType, ScreenStatus, ScreenData, InitializedPluginChannelConfiguration } from "common/types";
import readFolder, { ReadFolderResult } from "../starcraft/get-files";
import path from "path";
import logService from "../logger/singleton";
import { MathUtils } from "three";
import transpile, { TransformSyntaxError } from "../transpile";
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

let _pluginsConfigs: InitializedPluginConfiguration[];

export const getPluginConfigs = () => _pluginsConfigs;
export const getPluginChannelConfigs = () => _pluginsConfigs.flatMap(p => p.channels);

const PLUGIN_PATH_MACRO = "_plugin_path_";
const CHANNEL_ID_MACRO = "_channel_id_";

export const replacePluginContent = (content: string, pluginPath: string, channelId: string) => {
    return content.replace(new RegExp(PLUGIN_PATH_MACRO, "g"), pluginPath).replace(new RegExp(CHANNEL_ID_MACRO, "g"), channelId);
}

const _tryLoadUtf8 = async (filepath: string, format: "json" | "text" | "xml" = "text"): Promise<any | null> => {
    try {
        const content = await fsPromises.readFile(filepath, { encoding: "utf8" });
        if (format === 'json') {
            return JSON.parse(content);
        } else if (format === "xml") {
            return cheerio.load(content, { xmlMode: false });
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

    const _pluginIds = new Set<string>();

    for (const folder of folders) {
        if (folder.isFolder) {
            const userConfig = await _tryLoadUtf8(path.join(folder.path, "userConfig.json"), "json");
            const pluginNative = await _tryLoadUtf8(path.join(folder.path, "native.js")) as string | null;
            const $ = await _tryLoadUtf8(path.join(folder.path, "plugin.html"), "xml") as CheerioAPI | null;

            if ($) {

                const pluginEl = $("plugin");
                const pluginId = pluginEl.prop("id");
                const pluginName = pluginEl.attr("name");
                const pluginVersion = pluginEl.attr("version");

                if (!pluginId) {
                    log.error(`@settings/load-plugins: Undefined plugin id - ${folder.name}`);
                    continue;
                }

                if (pluginVersion === undefined) {
                    log.error(`@settings/load-plugins: Undefined plugin version - ${folder.name}`);
                    continue;
                }

                if (pluginName === undefined) {
                    log.error(`@settings/load-plugins: Undefined plugin name - ${folder.name}`);
                    continue;
                }

                if (_pluginIds.has(pluginId)) {
                    log.error(`@settings/load-plugins: Duplicate plugin id - ${pluginEl.prop("id")}`);
                    continue;
                }
                _pluginIds.add(pluginId);

                if (!enabledPluginIds.includes(pluginId)) {
                    log.info(`@settings/load-plugins: ${pluginId} is not enabled in settings, skipping.`);
                    continue;
                }

                const channels: InitializedPluginChannelConfiguration[] = [];

                templateLoop:
                for (const channelEl of $("panel", pluginEl)) {

                    const screenKey = ($(channelEl).prop("screen") ?? "");
                    const screenDataKeys = Object.keys(screenDataMap);
                    const scriptContent = $("script", channelEl).html()?.toString() ?? null;

                    if (!scriptContent) {
                        log.error(`@settings/load-channel: Undefined script content - ${folder.name}`);
                        continue;
                    }

                    if (screenKey && !screenDataKeys.includes(screenKey)) {
                        log.error(`@settings/load-channel: screen ${screenKey} is invalid, must be one of ${Object.keys(screenDataMap).join(",")}.`);
                        continue templateLoop;
                    }

                    const channelId = MathUtils.generateUUID();
                    const transpileErrors: TransformSyntaxError[] = [];

                    const transpiledContent = transpile(replacePluginContent(scriptContent, folder.name, channelId), transpileErrors)?.code ?? null;

                    if (transpileErrors.length > 0) {
                        log.error(`@settings/load-plugins: ${pluginId} - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`);
                        continue;
                    }

                    channels.push({
                        id: channelId,
                        snap: $(channelEl).prop("snap") ?? "",
                        screen: screenDataMap[screenKey as keyof typeof screenDataMap],
                        scriptContent: transpiledContent
                    });
                }

                _pluginsConfigs.push({
                    id: pluginId,
                    name: pluginName,
                    version: pluginVersion,
                    description: pluginEl.attr("description"),
                    author: pluginEl.attr("author"),
                    path: folder.name,
                    userConfig,
                    channels,
                    nativeSource: pluginNative
                });
            }
        }

    }
}