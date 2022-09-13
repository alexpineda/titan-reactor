import { Assets, OpenBW } from "common/types";
import Janitor from "@utils/janitor";
import { createPluginSession } from "./create-plugin-session";
import { createReactiveSessionVariables, SessionChangeEvent } from "./reactive-session-variables";
import { ipcRenderer } from "electron";
import { CLEAR_ASSET_CACHE, RELOAD_PLUGINS } from "common/ipc-handle-names";
import { HOOK_ON_FRAME_RESET, HOOK_ON_SCENE_DISPOSED, HOOK_ON_SCENE_READY } from "@plugins/hooks";
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
import { mixer } from "@audio/main-mixer";
import { createMacrosComposer } from "./macros-composer";
import { createInputComposer } from "./input-composer";
import { createGameLoopComposer } from "./game-loop-composer";
import _ from "lodash";
import settingsStore from "@stores/settings-store";
import { renderComposer } from "@render/render-composer";

export const createWorld = async (openBW: OpenBW, assets: Assets, map: Chk, basePlayers: BasePlayer[], commands: CommandsStream) => {

    const janitor = new Janitor();
    const sessionApi = janitor.mop(createReactiveSessionVariables());
    const macrosComposer = janitor.mop(createMacrosComposer(sessionApi));

    let plugins = await createPluginSession(macrosComposer);

    const fogOfWarEffect = janitor.mop(new FogOfWarEffect());
    const fogOfWar = new FogOfWar(map.size[0], map.size[1], openBW, fogOfWarEffect);
    const surfaceComposer = janitor.mop(createSurfaceComposer(map, sessionApi));
    const sceneComposer = janitor.mop(await createSceneComposer(surfaceComposer, map, basePlayers, openBW, assets, fogOfWar));
    const postProcessingComposer = janitor.mop(createPostProcessingComposer(sceneComposer, surfaceComposer, sessionApi, fogOfWarEffect, openBW, assets));
    const inputComposer = janitor.mop(createInputComposer(surfaceComposer, map, sessionApi));
    const minimapGraphicsComposer = createMinimapGraphicsComposer(map, sceneComposer, surfaceComposer, fogOfWar, assets);
    const sandboxApi = createSandboxApi(openBW, sceneComposer.pxToWorldInverse);
    const commandsComposer = createCommandsComposer(commands);
    const gameLoopComposer = janitor.mop(createGameLoopComposer());

    const getSceneController = (name: string) => {
        return plugins.nativePlugins.getSceneInputHandlers().find((handler) => handler.name === name);
    }

    const setSceneController = async (controllername: string, defaultData?: any) => {
        const sceneController = getSceneController(controllername);
        if (sceneController) {
            plugins.nativePlugins.setActiveSceneController(sceneController);
            await surfaceComposer.viewports.activate(sceneController, defaultData);
        } else {
            throw new Error(`Scene controller ${controllername} not found`);
        }
    }

    const unsetSceneController = () => {
        plugins.nativePlugins.setActiveSceneController(undefined);
        surfaceComposer.viewports.activate(null);
    }

    // units.externalOnClearUnits = () => {
    //     // selectedUnits.clear();
    //     // followedUnits.clear();
    // };
    // units.externalOnCreateUnit = (unit) => plugins.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit);
    // //TODO: killed vs destroyed
    // units.externalOnFreeUnit = (unit) => {
    //     plugins.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit);
    //     // selectedUnits.delete(unit);
    //     // followedUnits.delete(unit);
    // }

    janitor.on(ipcRenderer, CLEAR_ASSET_CACHE, () => {
        assets.resetAssetCache();
        sceneComposer.resetImageCache();
        _reset();
    });

    const sessionListener = ({ detail: { settings, rhs } }: SessionChangeEvent) => {

        if (surfaceComposer.viewports.activeSceneController) {

            if (rhs.game?.sceneController && rhs.game.sceneController !== surfaceComposer.viewports.activeSceneController.name) {
                setTimeout(() => setSceneController(settings.game.sceneController), 0);
            }

            if (surfaceComposer.primaryRenderMode3D && rhs.postprocessing3d) {
                postProcessingComposer.updatePostProcessingOptions(settings.postprocessing3d)
            } else if (surfaceComposer.primaryRenderMode3D === false && rhs.postprocessing) {
                postProcessingComposer.updatePostProcessingOptions(settings.postprocessing)
            }

        }

    };
    //@ts-ignore cant type EventTarget?
    janitor.addEventListener(sessionApi.events, "change", sessionListener, { passive: true });

    let _reset = () => { };

    const openBwComposer = createOpenBWComposer(openBW, sceneComposer, surfaceComposer, fogOfWar, () => _reset());

    //TODO: move to runtime
    const simpleText = janitor.mop(new SimpleText());

    const gameTimeApi: GameTimeApi = {
        type: "replay",
        map,
        assets,
        exitScene() {
            setTimeout(() => {
                sessionApi.sessionVars.game.sceneController.setToDefault();
            }, 0)
        },
        sandboxApi,
        ...surfaceComposer.surfaceGameTimeApi,
        ...sceneComposer.sceneGameTimeApi,
        ...openBwComposer.openBWGameTimeApi,
        refreshScene: () => _reset(),
        simpleMessage(val: string) {
            simpleText.set(val);
        },
    }

    let reset: (() => void) | null = null;

    return {

        // binding stuff we can' t do before hand
        init() {

            window.gc!();

            surfaceComposer.resize(true);

            postProcessingComposer.onRenderModeChange(this.onFrameReset.bind(this));
            gameLoopComposer.onUpdate(this.update.bind(this));

            janitor.on(ipcRenderer, RELOAD_PLUGINS, async () => {
                await this.activate(true, sessionApi.getState().game.sceneController)
            });

        },
        async activate(reloadPlugins: boolean, sceneController: string, targetData?: any) {

            openBW.setGameSpeed(1);
            openBW.setPaused(false);
            gameLoopComposer.stop();

            if (reloadPlugins) {
                unsetSceneController();
                await (settingsStore().load());
                plugins.nativePlugins.callHook(HOOK_ON_SCENE_DISPOSED);

                plugins.dispose();
                plugins = await createPluginSession(macrosComposer);
            }

            plugins.initializeContainer(gameTimeApi, sessionApi);
            await setSceneController(sceneController, targetData);

            await plugins.nativePlugins.callHookAsync(HOOK_ON_SCENE_READY);

            this.onRender(0, 0);
            renderComposer.getWebGLRenderer().compile(sceneComposer.scene, surfaceComposer.primaryCamera);

            gameLoopComposer.start();

        },
        sceneComposer,
        surfaceComposer,
        inputComposer,
        sessionApi,

        dispose: () => {
            plugins.nativePlugins.callHook(HOOK_ON_SCENE_DISPOSED);
            plugins.dispose();
            janitor.dispose();
        },

        update(
            delta: number,
            elapsed: number
        ) {

            if (!surfaceComposer.viewports.primaryViewport) return;

            if (reset) {
                reset();
            }

            inputComposer.update(delta, elapsed);

            mixer.updateFromVector3(surfaceComposer.viewports.onUpdateAudioMixerLocation(delta, elapsed), delta);

            if (openBwComposer.update(elapsed)) {

                sceneComposer.onFrame(delta);

                minimapGraphicsComposer.onFrame()

                plugins.uiPlugins.onFrame(openBW, openBwComposer.currentFrame, openBW._get_buffer(8), openBW._get_buffer(9), [])// selectedUnits.values());

                commandsComposer.onFrame(openBwComposer.currentFrame);

                plugins.nativePlugins.hook_onFrame(
                    openBwComposer.currentFrame,
                    commandsComposer.commandsThisFrame
                );

            }

            this.onRender(delta, elapsed);

        },

        onRender: (delta: number, elapsed: number) => {

            plugins.nativePlugins.hook_onBeforeRender(delta, elapsed);

            postProcessingComposer.render(delta, elapsed);

            surfaceComposer.onRender(delta);

            plugins.nativePlugins.hook_onRender(delta, elapsed);

        },

        onFrameReset() {

            openBwComposer.onFrameReset();
            sceneComposer.onFrameReset();
            postProcessingComposer.onFrameReset();
            commandsComposer.onFrameReset();

            plugins.nativePlugins.callHook(HOOK_ON_FRAME_RESET, openBwComposer.currentFrame);

            reset = null;

        }
    };
};
