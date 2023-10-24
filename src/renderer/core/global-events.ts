import { TypeEmitter } from "@utils/type-emitter";
import type Chk from "bw-chk";
import { LogLevel } from "common/logging";
import { MacroAction, PluginConfig, PluginMetaData, SettingsMeta } from "common/types";
import { ValidatedReplay } from "renderer/scenes/replay-scene-loader";

export interface GlobalEvents {
    "webglcontextlost": undefined;
    "webglcontextrestored": undefined;
    "command-center-save-settings": SettingsMeta;
    "command-center-plugin-config-changed": { pluginId: string; config: PluginConfig };
    "command-center-plugins-activated": PluginMetaData[];
    "command-center-plugin-deactivated": string;
    "unsafe-open-url": string;
    "load-iscriptah": string;
    "queue-files": { files: File[]; append?: boolean };
    "log-message": { message: string; level: LogLevel; server?: boolean };
    "initial-install-error-plugins": undefined;
    "reload-all-plugins": undefined;
    "exec-macro": string;
    "reset-macro-actions": string;
    "exec-macro-action": { action: MacroAction; withReset: boolean };
    "document-hidden": boolean;
    "end-of-replay-queue": undefined;
    "clear-replay-queue": undefined;
    "replay-ready": { replay: ValidatedReplay; map: Chk };
    "replay-complete": ValidatedReplay;
    "map-ready": { map: Chk };
}

export const globalEventKeys: ( keyof GlobalEvents )[] = [
    "webglcontextlost",
    "webglcontextrestored",
    "command-center-save-settings",
    "command-center-plugin-config-changed",
    "command-center-plugins-activated",
    "command-center-plugin-deactivated",
    "unsafe-open-url",
    "load-iscriptah",
    "queue-files",
    "log-message",
    "initial-install-error-plugins",
    "reload-all-plugins",
    "exec-macro",
    "reset-macro-actions",
    "exec-macro-action",
    "document-hidden",
    "end-of-replay-queue",
    "clear-replay-queue",
    "replay-ready",
    "replay-complete",
    "map-ready",
];

/**
 * Centralized event emitter for global events.
 */
export const globalEvents = new TypeEmitter<GlobalEvents>();
