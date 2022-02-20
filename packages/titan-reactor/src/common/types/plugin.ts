import { GameStatePosition, Unit } from "../../renderer/core";
import { Scene } from "../../renderer/render";
import { ScreenType } from ".";
import { ScreenStatus } from ".";

export type PluginContentSize = {
    width: number; height: number;
};

export type AvailableDimensions = "content" | "minimapWidth" | "minimapHeight" | "width" | "height" | "left" | "bottom" | "top" | "right";

export type AvailableLifecycles = "@replay/loading" | "@replay/ready" | "@map/loading" | "@map/ready";
export type PluginPositioning = {
    "layout.top"?: AvailableDimensions | number | string;
    "layout.left"?: AvailableDimensions | number | string;
    "layout.right"?: AvailableDimensions | number | string;
    "layout.bottom"?: AvailableDimensions | number | string;
    "layout.width"?: AvailableDimensions | number | string;
    "layout.height"?: AvailableDimensions | number | string;
    "layout.stack"?: AvailableDimensions | number | string;
}

export type WorkerPluginConfig = {
    type: "worker",
    url?: string,
    "access.read"?: [];
    "access.write"?: [];
}
export type IFramePluginConfig = PluginPositioning & Omit<WorkerPluginConfig, "type"> & {
    type: "iframe",
    pointerInteraction: boolean;
}
export interface PluginJSON {
    name: string;
    author?: string;
    "worker.url"?: string;
    "iframe.url"?: string;
    "iframe.keepAlive"?: boolean,
    "worker.keepAlive"?: boolean,
    userConfig: any;
    channels: Record<AvailableLifecycles, (IFramePluginConfig | WorkerPluginConfig)[]>
}

type ScreenData = {
    screenType: ScreenType;
    screenStatus: ScreenStatus;
}

export type InitializedIFramePluginConfig = IFramePluginConfig & ScreenData;
export type InitializedWorkerPluginConfig = IFramePluginConfig & ScreenData;
export interface InitializedPluginJSON extends Omit<PluginJSON, "channels"> {
    native?: string;
    channels: (InitializedIFramePluginConfig | InitializedWorkerPluginConfig)[];
}

export interface PluginLifecycle {
    onInitialized(config: InitializedPluginJSON): void;
    onConnected(screenType: ScreenType, screenStatus: ScreenStatus): void;
    onDisconnected(): void;
    onDispose?(): void;
    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void;
}