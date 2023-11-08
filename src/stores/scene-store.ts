import { log } from "@ipc/log";
import { renderAppUI } from "../scenes/app";
import create from "zustand";
import { TRScene } from "../scenes/scene";
import { getWraithSurface } from "../scenes/home/space-scene";

export interface SceneStore {
    scene: TRScene | null;
    nextScene: TRScene | null;
    status: "idle" | "loading" | "error";
    loadScene: (scene: TRScene, options?: ExecSceneOptions) => Promise<void>;
    clearError: () => void;
    reset(): void;
    disposer: (() => void) | void;
    error: Error | null;

}

type ExecSceneOptions = {
    ignoreSameScene?: boolean;
    beforeStart?: () => Promise<void>;
};

/**
 * A store that manages the current scene.
 * When a scene is loaded, the previous one gets disposed.
 */
export const useSceneStore = create<SceneStore>((set, get) => ({
    scene: null,
    disposer: undefined,
    status: "idle",
    nextScene: null,
    error: null,
    loadScene: async (scene: TRScene, _opts: ExecSceneOptions = {}) => {
        const { ignoreSameScene } = {
            ignoreSameScene: false,
            ..._opts,
        };

        if (get().scene?.id === scene.id && ignoreSameScene) {
            return;
        }

        if (get().status === "loading") {
            console.error("Scene is already loading");
            return;
        }
        set({ status: "loading", nextScene: scene })

        if (scene.preload) {
            const state = await scene.preload( get().scene );
            if (state) {
                get().disposer && get().disposer!();
                set({ disposer: undefined, scene: null });
                renderAppUI({
                    scene: state.component!,
                    surface: state.surface,
                    key: state.key ?? scene.id,
                    hideCursor: scene.hideCursor
                });
            }
        }

        try {
            const state = await scene.load( get().scene );
            get().disposer && get().disposer!();
            set({ disposer: state.dispose, scene: null});
            renderAppUI({
                scene: state.component!,
                surface: state.surface,
                key: state.key ?? scene.id,
                hideCursor: scene.hideCursor
            });
            set({ scene, nextScene: null });
            set({ status: "idle" });
        } catch (err: any) {
            if (err instanceof Error) {
                log.error(err.stack);
                set({ error: err, status: "error", scene: null, nextScene: null })
                renderAppUI({
                    surface: getWraithSurface().canvas,
                    key: "error",
                    scene: null,
                })
            } else {
                log.error(err);
            }
        }
    },
    reset() {
        set({ scene: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));

export default () => useSceneStore.getState();
