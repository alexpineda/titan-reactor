export type SceneStateID =
    | "@home"
    | "@loading"
    | "@replay"
    | "@map"
    | "@iscriptah"
    | "@interstitial"
    | "@auth";

export interface SceneState {
    id: SceneStateID;
    dispose: ( newId?: SceneStateID ) => void;
    start: ( prevId?: SceneStateID ) => void;
    beforeNext?: ( newId?: SceneStateID ) => void;
}
