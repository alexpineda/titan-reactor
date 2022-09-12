import * as log from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
import create from "zustand";
import { SceneState } from "../scenes/scene";

export type SceneStore = {
    state: SceneState | null;
    execSceneLoader: (load: () => Promise<SceneState> | SceneState) => Promise<void>;
    error: Error | null;
    setError: (error: Error) => void;
    clearError: () => void;
};

let _loading = false;

export const useSceneStore = create<SceneStore>((set, get) => ({
    scene: null,
    state: null,
    error: null,
    execSceneLoader: async (loader: (prevData?: any) => Promise<SceneState> | SceneState) => {
        if (_loading) {
            console.warn("Scene is already loading");
        }
        _loading = true;

        get().clearError();
        const oldState = get().state;
        let prevData: any = undefined;
        if (oldState) {
            try {
                prevData = oldState.dispose();
            } catch (e) {
                log.error(withErrorMessage(e, "Error disposing old scene"));
            }
        }

        try {
            const state = await loader(prevData);
            oldState && oldState.beforeNext && oldState.beforeNext();
            set({
                state
            });
            await state.start(oldState?.id);
        } catch (err: any) {
            if (err instanceof Error) {
                log.error(err.stack);
            } else {
                log.error(err);
            }
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
}));

export default () => useSceneStore.getState()