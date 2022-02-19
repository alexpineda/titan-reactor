import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus } from ".";

export type PluginLayoutPreset = "left-bottom" | "left-top" | "left" | "hide";

export type PluginContentSize = {
    width: number; height: number;
};

export type PluginWithContentRect = {
    plugin: PluginInstance;
    contentRect?: PluginContentSize;
};

export type PluginPositions = {
    topLeft: PluginWithContentRect[];
    topRight: PluginWithContentRect[];
    bottomLeft: PluginWithContentRect[];
    bottomRight: PluginWithContentRect[];
    left: PluginWithContentRect[];
    right: PluginWithContentRect[];
    top: PluginWithContentRect[];
    bottom: PluginWithContentRect[];
    hidden: PluginWithContentRect[];
};
export interface PluginPositioning {
    position: keyof PluginPositions;
    align: string;
    stretch: boolean;
}
export interface PluginConfigLifecycle {
    pointerInteraction: boolean;
    lifecycle: Record<string, PluginPositioning | keyof PluginPositions>;
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

export interface PluginInstance extends PluginJSON {
    src: string;
    iframe?: HTMLIFrameElement | null;
    import?: string;
    api: PluginLifecycle;
}

export interface PluginLifecycle {
    onInitialized(config: PluginConfigLifecycle, userConfig: any, onContentSize: (size: PluginContentSize) => void): void;
    onConnected(iframe: HTMLIFrameElement | null | undefined, screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}