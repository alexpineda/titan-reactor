import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus } from ".";

export type PluginLayoutPreset = "left-bottom" | "left-top" | "left" | "hide";

export interface PluginConfig {
    url: string;
    name: string;
    author?: string;
    read: string[];
    write: string[];
    config: any;
    userConfig: any;
}

export interface Plugin extends PluginConfig {
    src: string;
    iframe?: HTMLIFrameElement | null;
    import?: string;
    api: RealtimePluginAPI;
}

export interface RealtimePluginAPI {
    onInitialized(config: any, userConfig: any): void;
    onBeforeConnect(screenType: ScreenType, screenStatus: ScreenStatus): boolean;
    onConnected(iframe: HTMLIFrameElement | null | undefined, screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}