import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus } from ".";

export type PluginLayoutPreset = "left-bottom" | "left-top" | "left" | "hide";

export interface BaseLayoutPluginConfig {
    layout: {
        pointerEvents: boolean,
        textSelectable: boolean,
        string: string
    },
    string: any
}

export interface GameBridgePluginConfig extends BaseLayoutPluginConfig {
    gameBridge: {
        "read": string[],
        "write": string[],
    }
}
export interface PluginConfig {
    url: string;
    name: string;
    author?: string;
    read: string[];
    write: string[];
    config: GameBridgePluginConfig;
    userConfig: any;
}

export interface Plugin extends PluginConfig {
    src: string;
    iframe?: HTMLIFrameElement | null;
    import?: string;
    api: PluginAPI;
}

export interface PluginAPI {
    onInitialized(config: any, userConfig: any): void;
    onBeforeConnect(screenType: ScreenType, screenStatus: ScreenStatus): boolean;
    onConnected(iframe: HTMLIFrameElement | null | undefined, screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}