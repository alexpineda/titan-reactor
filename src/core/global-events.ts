import { PreProcessFile } from "@ipc/files";
import { TypeEmitter } from "@utils/type-emitter";
import type Chk from "bw-chk";
import type { MacroAction, PluginConfig, PluginMetaData } from "common/types";
import { ValidatedReplay } from "../scenes/load-and-validate-replay";

export interface GlobalEvents {
    "webglcontextlost": undefined;
    "webglcontextrestored": undefined;
    "command-center-plugin-config-changed": { pluginId: string; config: PluginConfig };
    "plugin-activated": PluginMetaData[];
    "plugin-deactivated": string;
    "unsafe-open-url": string;
    "load-iscriptah": string;
    "queue-files": { files: PreProcessFile[] };
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
    "xr-session-start": void;
    "xr-session-end": void;
    "metaverse-presence": { presence: any };
}

export const globalEventKeys: ( keyof GlobalEvents )[] = [
    "webglcontextlost",
    "webglcontextrestored",
    "command-center-plugin-config-changed",
    "plugin-activated",
    "plugin-deactivated",
    "unsafe-open-url",
    "load-iscriptah",
    "queue-files",
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
    "xr-session-start",
    "xr-session-end",
];

/**
 * Centralized event emitter for global events.
 */
export const globalEvents = new TypeEmitter<GlobalEvents>();
