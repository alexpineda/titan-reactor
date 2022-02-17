import create from "zustand";
import { ReplayPlayer } from "../../common/types";


export enum ScreenStatus {
    Loading,
    Ready,
    Error
}

export enum ScreenType {
    Map,
    Replay,
    IScriptah,
    Home
}

export interface MapLoadingInformation {
    type: ScreenType.Map;
    filename?: string;
    title?: string;
    description?: string;
};

export interface ReplayLoadingInformation {
    type: ScreenType.Replay;
    filename?: string;
    header?: {
        players: ReplayPlayer[];
    };
    chkTitle?: string;
};

export type ScreenStore = {
    type: ScreenType,
    status: ScreenStatus;
    loadingInfo?: ReplayLoadingInformation | MapLoadingInformation;
    error?: Error;
    init: (value: ScreenType) => void;
    updateLoadingInformation: (value: Partial<ReplayLoadingInformation> | Partial<MapLoadingInformation>) => void;
    complete: () => void;
    setError: (error: Error) => void;
};

export const useScreenStore = create<ScreenStore>((set) => ({
    type: ScreenType.Home,
    status: ScreenStatus.Loading,
    init: (value: ScreenType) => {
        set({ type: value, status: ScreenStatus.Loading, error: undefined, loadingInfo: undefined });
    },
    complete: () => {
        set({ status: ScreenStatus.Ready, error: undefined });
    },
    setError: (error: Error) => {
        set({ status: ScreenStatus.Error, error });
    },
    updateLoadingInformation: (loadingInfo: Partial<ReplayLoadingInformation> | Partial<MapLoadingInformation>) => {
        // @ts-ignore
        set({ loadingInfo });
    }
}));

export default () => useScreenStore.getState()