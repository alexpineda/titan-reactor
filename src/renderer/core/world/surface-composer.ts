import GameSurface from "@render/game-surface";
import { renderComposer } from "@render/render-composer";
import gameStore from "@stores/game-store";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import Janitor from "@utils/janitor";
import { Borrowed } from "@utils/object-utils";
import debounce from "lodash.debounce";
import { World } from "./world";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

export const createSurfaceComposer = (world: Borrowed<World>) => {

    const janitor = new Janitor();
    const gameSurface = janitor.mop(new GameSurface(...world.map!.size));

    gameSurface.canvas.style.cursor = "none";
    gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);
    janitor.mop(document.body.appendChild(gameSurface.canvas));

    renderComposer.targetSurface = gameSurface;

    gameStore().setDimensions(gameSurface.getMinimapDimensions(settingsStore().data.minimap.scale));

    const _sceneResizeHandler = () => {

        gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);

        renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);

        world.events!.emit("resize", gameSurface);

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

    // some values we do not keep in the user facing reactive variables but will want to listen to
    janitor.mop(useSettingsStore.subscribe(settings => {

        if (settings.data.graphics.pixelRatio !== gameSurface.pixelRatio) {

            sceneResizeHandler();

        }

    }));

    const surfaceRef = new WeakRef(gameSurface);

    world.events!.on("dispose", () => {
        janitor.dispose();
    })

    return {
        gameSurface,
        resize,
        surfaceGameTimeApi: {
            togglePointerLock: (val: boolean) => {
                const surface = surfaceRef.deref();
                if (surface) {
                    surface.togglePointerLock(val);
                }
            },
            get pointerLockLost() {
                const surface = surfaceRef.deref();
                if (surface) {
                    return surface.pointerLockLost;
                }
                return false;
            },
        }

    }

}