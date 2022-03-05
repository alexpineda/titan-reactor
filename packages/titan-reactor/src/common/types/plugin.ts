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

export type AvailableLifecycles = "@home/ready" | "@replay/loading" | "@replay/ready" | "@map/loading" | "@map/ready";

export interface PluginConfiguration {
    name: string;
    id: string;
    version: string;
    author?: string;
    description?: string;
    iframe?: "isolated" | "shared";
}

export type ScreenData = {
    type: ScreenType;
    status: ScreenStatus;
}

export type InitializedPluginChannelConfiguration = {
    id: string;
    snap?: string;
    scriptContent: string | null;
    screen?: ScreenData;
};

export interface InitializedPluginConfiguration extends PluginConfiguration {
    nativeSource?: string | null;
    userConfig: any;
    path: string;
    channels: InitializedPluginChannelConfiguration[];
}

export interface PluginLifecycle {
    onInitialized(config: InitializedPluginConfiguration): void;
    onConnected(screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;
    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}