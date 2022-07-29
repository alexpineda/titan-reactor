import * as log from "@ipc/log";
import create from "zustand";
import { ScreenStatus, ScreenType } from "../../common/types";

/**
 * High level screen state
 */
export type ScreenStore = {
    type: ScreenType,
    status: ScreenStatus;
    error: Error | null;
    init: (value: ScreenType) => void;
    complete: () => void;
    setError: (error: Error) => void;
    clearError: () => void;
    readonly isInGame: boolean
};

export const useScreenStore = create<ScreenStore>((set, get) => ({
    type: ScreenType.Home,
    status: ScreenStatus.Loading,
    error: null,
    init: (value: ScreenType) => {
        set({ type: value, status: ScreenStatus.Loading, error: null });
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
    },
    get isInGame() {
        return (get().type === ScreenType.Replay || get().type === ScreenType.Map) && get().status === ScreenStatus.Ready;
    }
}));

export default () => useScreenStore.getState()