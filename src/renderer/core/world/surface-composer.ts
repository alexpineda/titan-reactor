import { Surface } from "@image/canvas";
import GameSurface from "@render/game-surface";
import { renderComposer } from "@render/render-composer";
import gameStore from "@stores/game-store";
import { ReactiveSessionVariables, SessionChangeEvent } from "./reactive-session-variables";
import settingsStore from "@stores/settings-store";
import Janitor from "@utils/janitor";
import Chk from "bw-chk";
import debounce from "lodash.debounce";
import { Vector3 } from "three";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { CssScene } from "./css-scene";

export type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

export const createSurfaceComposer = (map: Chk, sessionApi: ReactiveSessionVariables) => {

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

        const rect = gameSurface.getMinimapDimensions(sessionApi.getState().game.minimapSize);
        gameStore().setDimensions({
            minimapWidth: rect.minimapWidth,
            minimapHeight: sessionApi.getState().game.minimapEnabled ? rect.minimapHeight : 0,
        });

        renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);
        cssScene.setSize(gameSurface.width, gameSurface.height);

        minimapSurface.setDimensions(
            rect.minimapWidth,
            rect.minimapHeight,
        );

        viewports.aspect = gameSurface.aspect;
    };

    const sceneResizeHandler = debounce(() => {
        _sceneResizeHandler()
    }, 100);

    janitor.addEventListener(window, "resize", sceneResizeHandler, {
        passive: true,
    })

    const viewports = janitor.mop(new GameViewportsDirector(gameSurface));

    viewports.externalOnCameraMouseUpdate = () => { };
    viewports.externalOnDrawMinimap = () => { };
    viewports.externalOnCameraKeyboardUpdate = () => { };
    viewports.externalOnMinimapDragUpdate = () => { };
    // viewports.externalOnExitScene = (sceneController) => macros.callFromHook("onExitScene", sceneController);
    viewports.beforeActivate = () => {

        sessionApi.sessionVars.game.minimapSize.setToDefault();
        sessionApi.sessionVars.game.minimapEnabled.setToDefault();

    }

    viewports.onActivate = () => {

        const rect = gameSurface.getMinimapDimensions(sessionApi.getState().game.minimapSize);
        gameStore().setDimensions({
            minimapWidth: rect.minimapWidth,
            minimapHeight: sessionApi.getState().game.minimapEnabled === true ? rect.minimapHeight : 0,
        });

        // unitSelectionBox.activate(sceneController.gameOptions?.allowUnitSelection, sceneController.viewports[0].camera, scene)

        resize();

    }

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

    //@ts-ignore cant type EventTarget?
    janitor.addEventListener(sessionApi.events, "change", sessionListener, { passive: true });

    const _target = new Vector3();

    return {
        cssScene,
        gameSurface,
        minimapSurface,
        viewports,
        onRender(delta: number) {
            for (const viewport of viewports.activeViewports()) {

                if (!viewport.freezeCamera) {
                    viewport.orbit.update(delta / 1000);
                    viewport.projectedView.update(viewport.camera, viewport.orbit.getTarget(_target));
                }

            }
            cssScene.render(viewports.primaryViewport.camera);
        },
        dispose() {
            janitor.dispose();
        },
        resize,
        get sceneController() {
            return viewports.activeSceneController;
        },
        get primaryCamera() {
            return viewports.primaryViewport.camera;
        },
        get primaryViewport() {
            return viewports.primaryViewport;
        },
        get primaryRenderMode3D() {
            return viewports.primaryViewport?.renderMode3D ?? false;
        },
        surfaceGameTimeApi: {
            cssScene,
            get viewport() {
                return viewports.viewports[0];
            },
            get secondViewport() {
                return viewports.viewports[1];
            },
            togglePointerLock: (val: boolean) => {
                gameSurface.togglePointerLock(val);
            },
            get pointerLockLost() {
                return gameSurface.pointerLockLost;
            },
            get mouseCursor() {
                return viewports.mouseCursor;
            },
            set mouseCursor(val: boolean) {
                viewports.mouseCursor = val;
            },
            //todo: deprecate
            changeRenderMode: (renderMode3D?: boolean) => {
                viewports.primaryViewport.renderMode3D = renderMode3D ?? !viewports.primaryViewport.renderMode3D;
            }
        }

    }

}