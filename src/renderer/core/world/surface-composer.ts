import { Surface } from "@image/canvas";
import GameSurface from "@render/game-surface";
import { renderComposer } from "@render/render-composer";
import gameStore from "@stores/game-store";
import { SessionChangeEvent } from "./reactive-session-variables";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import Janitor from "@utils/janitor";
import debounce from "lodash.debounce";
import { CssScene } from "./css-scene";
import { World } from "./world";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

export const createSurfaceComposer = ({ map, settings }: World) => {

    const janitor = new Janitor();


    const cssScene = new CssScene();

    const gameSurface = janitor.mop(new GameSurface(map.size[0], map.size[1]));

    gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);
    janitor.mop(document.body.appendChild(gameSurface.canvas));

    renderComposer.targetSurface = gameSurface;

    gameStore().setDimensions(gameSurface.getMinimapDimensions(settingsStore().data.game.minimapSize));

    const minimapSurface = janitor.mop(new Surface({
        position: "absolute",
        bottom: "0",
        zIndex: "20"
    }));

    janitor.mop(document.body.appendChild(minimapSurface.canvas));

    const _sceneResizeHandler = () => {
        gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);

        const rect = gameSurface.getMinimapDimensions(settings.getState().game.minimapSize);
        gameStore().setDimensions({
            minimapWidth: rect.minimapWidth,
            minimapHeight: settings.getState().game.minimapEnabled ? rect.minimapHeight : 0,
        });

        renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);
        cssScene.setSize(gameSurface.width, gameSurface.height);

        minimapSurface.setDimensions(
            rect.minimapWidth,
            rect.minimapHeight,
        );

    };

    const sceneResizeHandler = debounce(() => {
        _sceneResizeHandler()
    }, 100);

    janitor.addEventListener(window, "resize", sceneResizeHandler, {
        passive: true,
    })



    const resize = (immediate = false) => {
        if (immediate) {
            _sceneResizeHandler();
        } else {
            sceneResizeHandler();
        }
    }

    const sessionListener = ({ detail: { settings, rhs } }: SessionChangeEvent) => {

        if (rhs.game?.minimapSize) {
            resize();
        }

        if (rhs.game?.minimapEnabled && rhs.game.minimapEnabled !== settings.game.minimapEnabled) {
            minimapSurface.canvas.style.display = rhs.game.minimapEnabled ? "block" : "none";
            if (rhs.game.minimapEnabled) {
                minimapSurface.canvas.style.pointerEvents = "auto";
            }
        }

    };

    janitor.addEventListener(settings.events, "change", sessionListener, { passive: true });

    // some values we do not keep in the user facing reactive variables but will want to listen to
    janitor.mop(useSettingsStore.subscribe(settings => {
        if (settings.data.graphics.pixelRatio !== gameSurface.pixelRatio) {
            sceneResizeHandler();
        }
    }));

    return {
        cssScene,
        gameSurface,
        minimapSurface,
        dispose() {
            janitor.dispose();
        },
        resize,
        surfaceGameTimeApi: {
            cssScene,
            togglePointerLock: (val: boolean) => {
                gameSurface.togglePointerLock(val);
            },
            get pointerLockLost() {
                return gameSurface.pointerLockLost;
            },
        }

    }

}