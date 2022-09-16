import GameSurface from "@render/game-surface";
import gameStore from "@stores/game-store";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import Janitor from "@utils/janitor";
import debounce from "lodash.debounce";
import { CssScene } from "./css-scene";
import { World } from "./world";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

export const createSurfaceComposer = ({ map, settings, events }: World) => {

    const janitor = new Janitor();


    const cssScene = new CssScene();

    const gameSurface = janitor.mop(new GameSurface(map.size[0], map.size[1]));

    gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);
    janitor.mop(document.body.appendChild(gameSurface.canvas));

    gameStore().setDimensions(gameSurface.getMinimapDimensions(settingsStore().data.minimap.scale));

    const _sceneResizeHandler = () => {
        console.log("resize handler");
        gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);

        const rect = gameSurface.getMinimapDimensions(settings.getState().minimap.scale);

        gameStore().setDimensions({
            minimapWidth: rect.minimapWidth,
            minimapHeight: settings.getState().minimap.enabled ? rect.minimapHeight : 0,
        });

        cssScene.setSize(gameSurface.width, gameSurface.height);

        events.emit("resize", gameSurface);
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

    return {
        cssScene,
        gameSurface,
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