import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus, GameCanvasDimensions } from ".";

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

export type PluginChannelConfigurationBase = {
    type: string;
    url?: string,
    "access.read"?: string[];
    "access.write"?: string[];
    "access.assets"?: string[];
}
export type HTMLPluginChannelConfiguration = PluginChannelConfigurationBase & LayoutRect & {
    type: "html",
    pointerInteraction: boolean;
    "layout.slot"?: string;
    "layout.slot.order"?: number | string;
}

export type WorkerPluginChannelConfiguration = PluginChannelConfigurationBase & {
    type: "worker",
}

export type IFramePluginChannelConfiguration = Omit<HTMLPluginChannelConfiguration, "type"> & LayoutRect & {
    type: "iframe",
}

export type AvailableLifecycles = "@replay/loading" | "@replay/ready" | "@map/loading" | "@map/ready";

export interface PluginConfiguration {
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
    channels: Record<AvailableLifecycles, PluginChannelConfigurationBase[]>
}

type ScreenData = {
    screenType: ScreenType;
    screenStatus: ScreenStatus;
}

export type InitializedPluginChannelConfiguration<T extends PluginChannelConfigurationBase> = T & ScreenData & { url: string };

export interface InitializedPluginConfiguration extends Omit<PluginConfiguration, "channels"> {
    tag: string;
    nativeSource?: string;
    channels: InitializedPluginChannelConfiguration<PluginChannelConfigurationBase>[];
}

export interface PluginLifecycle {
    onInitialized(config: InitializedPluginConfiguration): void;
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

export interface GlobalPluginConfiguration {
    "respository": string[],
    "disabled": string[],
    "slots": SlotConfig[],
    "theme": string[]
}