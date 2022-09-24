import { TypeEmitter } from "@utils/type-emitter";
import { LogLevel } from "common/logging";
import { PluginMetaData, SettingsMeta } from "common/types";

export interface GlobalEvents {
    "webglcontextlost": void;
    "webglcontextrestored": void;
    "command-center-save-settings": SettingsMeta;
    "command-center-plugin-config-changed": { pluginId: string, config: any };
    "command-center-plugins-enabled": PluginMetaData[];
    "command-center-plugin-disabled": string;
    "unsafe-open-url": string;
    "load-home-scene": void;
    "load-replay-file": string;
    "load-map-file": string;
    "load-iscriptah": string;
    "log-message": { message: string, level: LogLevel, server?: boolean };
    "initial-install-error-plugins": void;
    "exec-macro": string;
    "document-hidden": boolean;
}

/**
 * Centralized event emitter for global events.
 */
export const globalEvents = new TypeEmitter<GlobalEvents>();