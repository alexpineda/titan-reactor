import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus } from ".";

export type PluginLayoutPreset = "left-bottom" | "left-top" | "left" | "hide";

export type PluginContentSize = {
    width: number; height: number;
};

export type PositionedPlugin = {
    plugin: Plugin;
    index: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    contentRect?: PluginContentSize;
};

export type PluginPositions = "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "top" | "bottom" | "left" | "right" | "hidden" | "inactive";
export interface PluginPositioning {
    position: PluginPositions;
    align?: string;
    stretch?: boolean;
    width?: number;
    height?: number;
}
export interface PluginConfigLifecycle {
    pointerInteraction: boolean;
    lifecycle: Record<string, PluginPositioning | PluginPositions>;
    string: any
}

export interface PluginConfigAccess extends PluginConfigLifecycle {
    access: {
        "read": string[],
        "write": string[],
    }
}
export interface PluginJSON {
    url: string;
    name: string;
    author?: string;
    read: string[];
    write: string[];
    config: PluginConfigAccess;
    userConfig: any;
}

export interface PluginConfig extends PluginJSON {
    src: string;
    iframe?: HTMLIFrameElement | null;
    import?: string;
}

export interface PluginLifecycle {
    onInitialized(config: PluginConfig): void;
    onConnected(screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}

export interface Plugin extends PluginLifecycle {
    iframe: HTMLIFrameElement;
    name: string;
    src: string;
    config?: PluginConfigLifecycle;
    userConfig: any;
}