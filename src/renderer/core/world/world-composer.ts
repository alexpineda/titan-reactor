import { Assets, OpenBW } from "common/types";
import Janitor from "@utils/janitor";
import { createPluginsAndMacroSession } from "./create-plugin-session";
import { createReactiveSessionVariables, SessionChangeEvent } from "./reactive-session-variables";
import { ipcRenderer } from "electron";
import { CLEAR_ASSET_CACHE, RELOAD_PLUGINS } from "common/ipc-handle-names";
import { HOOK_ON_SCENE_DISPOSED, HOOK_ON_SCENE_READY } from "@plugins/hooks";
import { GameTimeApi } from "./game-time-api";
import Chk from "bw-chk";
import { SimpleText } from "@render/simple-text";
import { createSandboxApi } from "@openbw/sandbox-api";
import { createSceneComposer } from "./scene-composer";
import { createPostProcessingComposer } from "./postprocessing-composer";
import { BasePlayer } from "../players";
import { FogOfWar, FogOfWarEffect } from "../fogofwar";
import { createSurfaceComposer } from "./surface-composer";
import { createOpenBWComposer } from "./openbw-composer";
import { createMinimapGraphicsComposer } from "./minimap-graphics-composer";
import CommandsStream from "@process-replay/commands/commands-stream";
import { createCommandsComposer } from "./commands-composer";
import { createInputComposer } from "./input-composer";
import { createGameLoopComposer } from "./game-loop-composer";
import { renderComposer } from "@render/render-composer";
import { createViewComposer } from "./view-composer";
import { TypeEmitter } from "@utils/type-emitter";
import { World, WorldEvents } from "./world";
import { mixer } from "@audio/main-mixer";

export const createWorld = async (openBW: OpenBW, assets: Assets, map: Chk, players: BasePlayer[], commands: CommandsStream) => {

    const janitor = new Janitor();

    const settings = janitor.mop(createReactiveSessionVariables());
    const events = janitor.mop(new TypeEmitter<WorldEvents>());
    const plugins = await createPluginsAndMacroSession(events, settings, openBW);

    const fogOfWarEffect = janitor.mop(new FogOfWarEffect());
    const fogOfWar = new FogOfWar(map.size[0], map.size[1], openBW, fogOfWarEffect);

    const world: World = {
        openBW,
        map,
        players,
        commands,
        fogOfWar,
        fogOfWarEffect,
        plugins,
        settings,
        janitor,
        events,
        reset() {
            frameResetRequested = true;
        }
    }

    const surfaceComposer = janitor.mop(createSurfaceComposer(world));
    const viewComposer = createViewComposer(surfaceComposer, settings);
    const sceneComposer = janitor.mop(await createSceneComposer(world, viewComposer, assets));
    const postProcessingComposer = janitor.mop(createPostProcessingComposer(world, sceneComposer, viewComposer, assets));
    const inputComposer = janitor.mop(createInputComposer(world, surfaceComposer, sceneComposer, viewComposer, assets));
    const minimapGraphicsComposer = createMinimapGraphicsComposer(world, sceneComposer, surfaceComposer, viewComposer, assets);
    const sandboxApi = createSandboxApi(openBW, sceneComposer.pxToWorldInverse);
    const commandsComposer = createCommandsComposer(commands);
    const gameLoopComposer = janitor.mop(createGameLoopComposer());
    const openBwComposer = createOpenBWComposer(world, sceneComposer, viewComposer);

    janitor.addEventListener(settings.events, "change", ({ detail: { settings } }: SessionChangeEvent) => mixer.setVolumes(settings.audio), { passive: true });

    const setSceneController = async (controllername: string, defaultData?: any) => {

        const sceneController = plugins.native.getSceneInputHandlers().find((handler) => handler.name === controllername)

        if (sceneController) {

            await viewComposer.activateSceneController(sceneController, defaultData);
            plugins.native.activateSceneController(sceneController);
            inputComposer.onSceneControllerActivated(sceneController);

        }

    }

    const unsetSceneController = () => {

        plugins.native.activateSceneController(undefined);
        viewComposer.activateSceneController(null);

    }

    janitor.on(ipcRenderer, CLEAR_ASSET_CACHE, () => {

        assets.resetAssetCache();
        sceneComposer.resetImageCache();
        frameResetRequested = true;

    });

    const sessionListener = ({ detail: { settings, rhs } }: SessionChangeEvent) => {

        if (viewComposer.activeSceneController) {

            if (rhs.game?.sceneController && rhs.game.sceneController !== viewComposer.activeSceneController.name) {
                setTimeout(() => setSceneController(settings.game.sceneController), 0);
            }

            if (viewComposer.primaryRenderMode3D && rhs.postprocessing3d) {
                postProcessingComposer.updatePostProcessingOptions(settings.postprocessing3d)
            } else if (viewComposer.primaryRenderMode3D === false && rhs.postprocessing) {
                postProcessingComposer.updatePostProcessingOptions(settings.postprocessing)
            }

        }

    };

    janitor.addEventListener(settings.events, "change", sessionListener, { passive: true });

    //TODO: move to runtime
    const simpleText = janitor.mop(new SimpleText());

    const gameTimeApi: GameTimeApi = {

        type: "replay",
        map,
        assets,
        exitScene() {
            setTimeout(() => {
                settings.sessionVars.game.sceneController.setToDefault();
            }, 0)
        },
        sandboxApi,
        ...surfaceComposer.surfaceGameTimeApi,
        ...sceneComposer.sceneGameTimeApi,
        ...openBwComposer.openBWGameTimeApi,
        ...viewComposer.viewportsGameTimeApi,
        refreshScene: () => frameResetRequested = true,
        simpleMessage(val: string) {
            simpleText.set(val);
        },

    }

    let frameResetRequested = false;

    return {

        // binding stuff we can' t do before hand
        init() {

            window.gc!();

            surfaceComposer.resize(true);

            postProcessingComposer.onRenderModeChange(() => frameResetRequested = true);
            gameLoopComposer.onUpdate(this.update.bind(this));

            janitor.on(ipcRenderer, RELOAD_PLUGINS, async () => {
                await this.activate(true, settings.getState().game.sceneController)
            });

        },
        async activate(reloadPlugins: boolean, sceneController: string, targetData?: any) {

            openBW.setGameSpeed(1);
            openBW.setPaused(false);
            gameLoopComposer.stop();

            if (reloadPlugins) {
                unsetSceneController();
                plugins.native.callHook(HOOK_ON_SCENE_DISPOSED);
                plugins.reload();
            }

            plugins.activate(gameTimeApi, settings);

            await setSceneController(sceneController, targetData);

            await plugins.native.callHookAsync(HOOK_ON_SCENE_READY);

            this.onRender(0, 0);
            renderComposer.getWebGLRenderer().compile(sceneComposer.scene, viewComposer.primaryCamera!);

            gameLoopComposer.start();

        },
        sceneComposer,
        surfaceComposer,
        inputComposer,
        world,

        dispose: () => {

            plugins.native.callHook(HOOK_ON_SCENE_DISPOSED);
            plugins.dispose();
            janitor.dispose();

        },

        update(
            delta: number,
            elapsed: number
        ) {

            if (!viewComposer.primaryViewport) return;

            if (frameResetRequested) {
                this.onFrameReset();
            }

            inputComposer.update(delta, elapsed);

            if (openBwComposer.update(elapsed)) {

                sceneComposer.onFrame(delta);

                minimapGraphicsComposer.onFrame()

                plugins.ui.onFrame(openBW, openBwComposer.currentFrame, openBW._get_buffer(8), openBW._get_buffer(9), [])// selectedUnits.values());

                commandsComposer.onFrame(openBwComposer.currentFrame);

                plugins.native.hook_onFrame(
                    openBwComposer.currentFrame,
                    commandsComposer.commandsThisFrame
                );

            }

            this.onRender(delta, elapsed);

        },

        onRender: (delta: number, elapsed: number) => {

            plugins.native.hook_onBeforeRender(delta, elapsed);

            viewComposer.update(delta, elapsed);

            postProcessingComposer.render(delta, elapsed);

            plugins.native.hook_onRender(delta, elapsed);

        },

        onFrameReset() {

            openBwComposer.onFrameReset();
            sceneComposer.onFrameReset();
            postProcessingComposer.onFrameReset();
            commandsComposer.onFrameReset();

            events.emit("frame-reset");
            frameResetRequested = false;

        }
    };
};
