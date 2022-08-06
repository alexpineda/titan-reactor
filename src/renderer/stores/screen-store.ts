import * as log from "@ipc/log";
import create from "zustand";
import { ScreenState, ScreenStatus, ScreenType } from "../../common/types";

/**
 * High level screen state
 */
export type ScreenStore = {
    type: ScreenType,
    status: ScreenStatus;
    state: ScreenState | null;
    error: Error | null;
    init: (value: ScreenType) => void;
    complete: () => void;
    setError: (error: Error) => void;
    clearError: () => void;
};

export const useScreenStore = create<ScreenStore>((set, get) => ({
    type: ScreenType.Home,
    status: ScreenStatus.Loading,
    state: null,
    error: null,
    init: (value: ScreenType) => {
        const state = get().state;
        state && state.dispose();
        set({ type: value, status: ScreenStatus.Loading, error: null, state: null });
    },
    complete: () => {
        set({ status: ScreenStatus.Ready, error: null });
    },
    setError: (error: Error) => {
        log.error(error.message);
        set({ error });
    },
    clearError: () => {
        set({ error: null });
    }
}));

export default () => useScreenStore.getState()