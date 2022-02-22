import * as log from "@ipc/log";
import create from "zustand";
import { ReplayPlayer, ScreenStatus, ScreenType } from "../../common/types";



export const isMapLoadingInformation = (information: any): information is MapLoadingInformation => {
    return information && information.title !== undefined;
}
export interface MapLoadingInformation {
    title: string;
    description: string;
};

export interface ReplayLoadingInformation {
    header: {
        players: ReplayPlayer[];
    };
    chkTitle: string;
};

export type ScreenStore = {
    type: ScreenType,
    status: ScreenStatus;
    loadingInfo?: ReplayLoadingInformation | MapLoadingInformation;
    error?: Error;
    init: (value: ScreenType) => void;
    updateLoadingInformation: (value: ReplayLoadingInformation | MapLoadingInformation) => void;
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
        log.error(error.message);
        set({ status: ScreenStatus.Error, error });
    },
    updateLoadingInformation: (loadingInfo: ReplayLoadingInformation | MapLoadingInformation) => {
        set({ loadingInfo });
    }
}));

export default () => useScreenStore.getState()