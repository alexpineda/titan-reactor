export type TRSceneID =
    | "@home"
    | "@loading"
    | "@replay"
    | "@map"
    | "@iscriptah"
    | "@interstitial"
    | "@auth";

export type TRSceneState = {
    component?: React.ReactNode;
    surface?: HTMLCanvasElement;
    dispose?: () => void;
}
export interface TRScene {
    id: TRSceneID;
    status?: "loading" | "ready" | "error";
    hideCursor?: boolean;

    preloadComponent?: React.ReactNode;
    preloadSurface?: HTMLCanvasElement;

    load(): Promise<TRSceneState>;
}