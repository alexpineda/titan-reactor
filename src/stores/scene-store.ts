import { log } from "@ipc/log";
import { renderAppUI } from "../scenes/app";
import create from "zustand";
import { TRScene } from "../scenes/scene";

export interface SceneStore {
    scene: TRScene | null;
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
        set({ status: "loading" })

        if (scene.preloadComponent) {
            get().disposer && get().disposer!();
            set({ disposer: undefined });
            renderAppUI({
                scene: scene.preloadComponent!,
                surface: scene.preloadSurface,
                key: scene.id,
                hideCursor: scene.hideCursor
            });
        }

        try {
            const state = await scene.load();
            get().disposer && get().disposer!();
            set({ disposer: state.dispose });
            renderAppUI({
                scene: state.component!,
                surface: state.surface,
                key: scene.id,
                hideCursor: scene.hideCursor
            });
            set({ scene });
            set({ status: "idle" });
        } catch (err: any) {
            if (err instanceof Error) {
                log.error(err.stack);
                set({ error: err, status: "error" })
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
