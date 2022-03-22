import * as log from "@ipc/log";
import create from "zustand/vanilla";
import { ScreenStatus, ScreenType } from "../../common/types";

/**
 * High level screen state
 */
export type ScreenStore = {
    type: ScreenType,
    status: ScreenStatus;
    error?: Error;
    init: (value: ScreenType) => void;
    complete: () => void;
    setError: (error: Error) => void;
};

export const useScreenStore = create<ScreenStore>((set) => ({
    type: ScreenType.Home,
    status: ScreenStatus.Loading,
    init: (value: ScreenType) => {
        set({ type: value, status: ScreenStatus.Loading, error: undefined });
    },
    complete: () => {
        set({ status: ScreenStatus.Ready, error: undefined });
    },
    setError: (error: Error) => {
        log.error(error.message);
        set({ status: ScreenStatus.Error, error });
    }
}));

export default () => useScreenStore.getState()