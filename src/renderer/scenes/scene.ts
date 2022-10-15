export type SceneStateID =
    | "@home"
    | "@loading"
    | "@replay"
    | "@map"
    | "@iscriptah"
    | "@interstitial";

export interface SceneState {
    id: SceneStateID;
    dispose: () => void;
    start: (prevId?: SceneStateID) => void;
    beforeNext?: () => void;
}
