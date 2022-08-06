import * as log from "@ipc/log";
import create from "zustand";
import { SceneState, SceneStateID } from "common/types";

export type SceneStore = {
    state: SceneState | null;
    load: (load: () => Promise<SceneState>) => Promise<void>;
    error: Error | null;
    setError: (error: Error) => void;
    clearError: () => void;
    currentId: SceneStateID | undefined
};

let _loading = false;

export const useSceneStore = create<SceneStore>((set, get) => ({
    scene: null,
    state: null,
    error: null,
    load: async (loader: () => Promise<SceneState>) => {
        if (_loading) {
            return;
        }
        _loading = true;

        get().clearError();
        const oldState = get().state;
        oldState && oldState.dispose();

        try {
            const state = await loader();
            set({
                state
            });
            oldState && oldState.beforeNext && oldState.beforeNext();
            await state.start();
        } catch (err: any) {
            log.error(err.message);
            get().setError(err);
        }
        _loading = false;
    },
    setError: (error: Error) => {
        log.error(error.message);
        set({ error });
    },
    clearError: () => {
        set({ error: null });
    },
    get currentId() {
        return get().state?.id
    }
}));

export default () => useSceneStore.getState()