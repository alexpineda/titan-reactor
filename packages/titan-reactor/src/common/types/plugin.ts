import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus, GameCanvasDimensions } from ".";
import { url } from "inspector";

export type PluginContentSize = {
    width: number; height: number;
};


export type AvailableDimensions = "content" | keyof GameCanvasDimensions
export type LayoutValue = AvailableDimensions | number | string;
export type LayoutRect = {
    "layout.top"?: LayoutValue;
    "layout.left"?: LayoutValue;
    "layout.right"?: LayoutValue;
    "layout.bottom"?: LayoutValue;
    "layout.width"?: LayoutValue;
    "layout.height"?: LayoutValue;
}

export type PluginConfigBase = {
    type: string;
    url?: string,
    "access.read"?: string;
    "access.write"?: string[];
    "access.assets"?: string[];
}
export type HTMLPluginConfig = PluginConfigBase & LayoutRect & {
    type: "html",
    pointerInteraction: boolean;
    "layout.slot"?: string;
    "layout.slot.order"?: number | string;
}

export type WorkerPluginConfig = PluginConfigBase & {
    type: "worker",
}

export type IFramePluginConfig = Omit<HTMLPluginConfig, "type"> & LayoutRect & {
    type: "iframe",
}

export type AvailableLifecycles = "@replay/loading" | "@replay/ready" | "@map/loading" | "@map/ready";

export interface PluginJSON {
    name: string;
    version: string;
    author?: string;
    worker?: {
        url?: string;
        keepAlive?: boolean;
    },
    iframe?: {
        url?: string;
        keepAlive?: boolean;
    },
    template?: {
        url?: string;
    },
    native?: "isolated" | "inherited";
    userConfig: any;
    channels: Record<AvailableLifecycles, PluginConfigBase[]>
}

type ScreenData = {
    screenType: ScreenType;
    screenStatus: ScreenStatus;
}

export type InitializedPluginConfig<T extends PluginConfigBase> = T & ScreenData & { url: string };

export interface InitializedPluginJSON extends Omit<PluginJSON, "channels"> {
    nativeSource?: string;
    channels: InitializedPluginConfig<PluginConfigBase>[];
}

export interface PluginLifecycle {
    onInitialized(config: InitializedPluginJSON): void;
    onConnected(screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;
    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}

export interface SlotConfig extends LayoutRect {
    name: string;
    description?: string;
    direction: "none" | "horizontal-left" | "horizontal-right" | "vertical-up" | "vertical-down";
    overflow: "scroll" | "hidden";
}

export interface GlobalPluginConfig {
    "respository": string[],
    "disabled": string[],
    "slots": SlotConfig[],
    "theme": string[]
}