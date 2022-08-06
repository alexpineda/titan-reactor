export enum ScreenStatus {
    Loading,
    Ready
}

export enum ScreenType {
    Home,
    Replay,
    Map,
    IScriptah,
}

export type ScreenState = {
    dispose: () => void;
    start: () => void;
}