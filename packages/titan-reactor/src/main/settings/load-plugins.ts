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

                if (!pluginId) {
                    log.error(`@settings/load-plugins: Undefined plugin id - ${folder.name}`);
                    continue;
                }

                if (!pluginEl.prop("version")) {
                    log.error(`@settings/load-plugins: Undefined plugin version - ${folder.name}`);
                    continue;
                }

                if (!pluginEl.prop("name")) {
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
                for (const channelEl of $("channel", pluginEl)) {
                    const channelKeys = ($(channelEl).prop("screen") ?? "").split(",").map(s => s.trim()).filter(s => s !== "");

                    const screenDataKeys = Object.keys(screenDataMap);
                    for (const key of channelKeys) {
                        if (!screenDataKeys.includes(key)) {
                            log.error(`@settings/load-channel: channel ${channelKeys} is invalid, must be one of ${Object.keys(screenDataMap).join(",")}.`);
                            continue templateLoop;
                        }
                    }

                    const screens = channelKeys.map(keys => screenDataMap[keys as keyof typeof screenDataMap]);
                    const style = $("style", channelEl).html()?.toString() ?? "";
                    const scriptContent = $("script", channelEl).html()?.toString() ?? null;

                    const transpileErrors: TransformSyntaxError[] = [];
                    const channelId = MathUtils.generateUUID();
                    const channel: InitializedPluginChannelConfiguration = {
                        id: channelId,
                        snap: $(channelEl).prop("snap") ?? "",
                        screens,
                        style: replacePluginContent(style, folder.name, channelId),
                        scriptContent: scriptContent ? transpile(replacePluginContent(scriptContent, folder.name, channelId), transpileErrors) : null,
                    }
                    if (transpileErrors.length > 0) {
                        log.error(`@settings/load-plugins: ${pluginId} - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`);
                        continue;
                    }

                    channels.push(channel);
                }

                _pluginsConfigs.push({
                    id: pluginId,
                    name: pluginEl.prop("name"),
                    version: pluginEl.prop("version"),
                    description: pluginEl.prop("description"),
                    author: pluginEl.prop("author"),
                    path: folder.name,
                    userConfig,
                    channels,
                    nativeSource: pluginNative
                });
            }
        }

    }
}