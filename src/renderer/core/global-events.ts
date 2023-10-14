import { Replay } from "@process-replay/parse-replay";
import { TypeEmitter } from "@utils/type-emitter";
import Chk from "bw-chk";
import { LogLevel } from "common/logging";
import { MacroAction, PluginConfig, PluginMetaData, SettingsMeta } from "common/types";

export interface GlobalEvents {
    "webglcontextlost": undefined;
    "webglcontextrestored": undefined;
    "command-center-save-settings": SettingsMeta;
    "command-center-plugin-config-changed": { pluginId: string; config: PluginConfig };
    "command-center-plugins-activated": PluginMetaData[];
    "command-center-plugin-deactivated": string;
    "unsafe-open-url": string;
    "load-home-scene": undefined;
    "load-replay-file": string;
    "load-map-file": string;
    "load-iscriptah": string;
    "log-message": { message: string; level: LogLevel; server?: boolean };
    "initial-install-error-plugins": undefined;
    "reload-all-plugins": undefined;
    "exec-macro": string;
    "reset-macro-actions": string;
    "exec-macro-action": { action: MacroAction; withReset: boolean };
    "document-hidden": boolean;
    "end-of-replay-queue": undefined;
    "replay-ready": { replay: Replay, map: Chk };
    "map-ready": { map: Chk };
}

/**
 * Centralized event emitter for global events.
 */
export const globalEvents = new TypeEmitter<GlobalEvents>();
