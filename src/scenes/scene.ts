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
    key?: string;
    dispose?: () => void;
}
export interface TRScene {
    id: TRSceneID;
    status?: "loading" | "ready" | "error";
    hideCursor?: boolean;

    preload?(prevScene: TRScene | null): Promise<TRSceneState | null>;
    load(prevScene: TRScene | null): Promise<TRSceneState>;
}