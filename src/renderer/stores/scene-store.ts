import { log } from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
import create from "zustand";
import { SceneState, SceneStateID } from "../scenes/scene";

export type SceneLoader = (prevData?: any) => Promise<SceneState> | SceneState;

export interface SceneStore {
    state: SceneState | null;
    execSceneLoader: (
        loader: SceneLoader,
        id: SceneStateID,
        options?: ExecSceneOptions
    ) => Promise<void>;
    error: Error | null;
    setError: (error: Error) => void;
    clearError: () => void;
    reset(): void;
}

type ExecSceneOptions = {
    errorHandler?: {
        loader: SceneLoader;
        id: SceneStateID;
    };
    clearError?: boolean;
    ignoreSameScene?: boolean;
    beforeStart?: () => Promise<void>;
};

const _lastLoadId: string = "";

let _loading = false;

/**
 * A store that manages the current scene.
 * When a scene is loaded, the previous one gets disposed.
 */
export const useSceneStore = create<SceneStore>((set, get) => ({
    state: null,
    error: null,
    execSceneLoader: async (
        loader: SceneLoader,
        id: SceneStateID,
        _opts: ExecSceneOptions = {}
    ) => {
        const { ignoreSameScene, clearError, errorHandler, beforeStart } = {
            clearError: true,
            ignoreSameScene: false,
            ..._opts,
        };

        if (_loading) {
            throw new Error("Scene is already loading");
        }
        if (_lastLoadId === id && !ignoreSameScene) {
            return;
        }
        _loading = true;

        if (clearError) {
            get().clearError();
        }

        const oldState = get().state;
        let prevData: any = undefined;
        if (oldState) {
            try {
                prevData = oldState.dispose(id);
            } catch (e) {
                log.error(withErrorMessage(e, "Error disposing old scene"));
            }
        }

        try {
            const state = await loader(prevData);
            oldState?.beforeNext && oldState.beforeNext(id);
            if (beforeStart) {
                await beforeStart();
            }
            if (window.gc) {
                window.gc();
            }
            state.start(oldState?.id);
            set({ state });
        } catch (err: any) {
            if (err instanceof Error) {
                log.error(err.stack);
                get().setError(err);
            } else {
                log.error(err);
            }
            if (errorHandler) {
                get().reset();
                setTimeout(() => {
                    void get().execSceneLoader(errorHandler.loader, errorHandler.id, {
                        clearError: false,
                    });
                }, 0);
            }
        }
        _loading = false;
    },
    reset() {
        set({ state: null });
    },
    setError: (error: Error) => {
        log.error(error.message);
        set({ error });
    },
    clearError: () => {
        set({ error: null });
    },
}));

export default () => useSceneStore.getState();
