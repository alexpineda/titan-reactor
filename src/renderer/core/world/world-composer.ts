import { OpenBW } from "common/types";
import { Assets } from "@image/assets";
import { Janitor } from "three-janitor";
import { createPluginsAndMacroSession } from "./create-plugins-and-macros-session";
import { createSettingsSessionStore } from "./settings-session-store";
import { ipcRenderer } from "electron";
import { CLEAR_ASSET_CACHE, RELOAD_PLUGINS } from "common/ipc-handle-names";
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
import { createOverlayComposer } from "./overlay-composer";
import CommandsStream from "@process-replay/commands/commands-stream";
import { createCommandsComposer } from "./commands-composer";
import { createGameLoopComposer } from "./game-loop-composer";
import { createViewControllerComposer } from "./view-composer";
import { TypeEmitter } from "@utils/type-emitter";
import { World } from "./world";
import { mix } from "@utils/object-utils";
import { mixer } from "@core/global";
import { WorldEvents } from "./world-events";
import { createInputComposer } from "./input-composer";

export const createWorldComposer = async (
    openBW: OpenBW,
    assets: Assets,
    map: Chk,
    players: BasePlayer[],
    commands: CommandsStream
) => {
    const janitor = new Janitor( "WorldComposer" );
    const events = janitor.mop( new TypeEmitter<WorldEvents>(), "events" );
    const settings = janitor.mop( createSettingsSessionStore( events ) );
    const plugins = await createPluginsAndMacroSession( events, settings, openBW );
    const fogOfWarEffect = janitor.mop( new FogOfWarEffect(), "FogOfWarEffect" );
    const fogOfWar = new FogOfWar( map.size[0], map.size[1], openBW, fogOfWarEffect );

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
        reset: () => {
            frameResetRequested = true;
        },
    };
    let frameResetRequested = false;

    const gameLoopComposer = createGameLoopComposer( world );
    const surfaceComposer = createSurfaceComposer( world );
    const sceneComposer = await createSceneComposer( world, assets );
    const commandsComposer = createCommandsComposer( world, commands );
    const inputsComposer = createInputComposer( world, sceneComposer );
    const viewControllerComposer = createViewControllerComposer( world, surfaceComposer );
    const sandboxApi = createSandboxApi( world, sceneComposer.pxToWorldInverse );
    const openBwComposer = createOpenBWComposer(
        world,
        sceneComposer,
        viewControllerComposer
    );

    const postProcessingComposer = createPostProcessingComposer(
        world,
        sceneComposer,
        viewControllerComposer,
        assets
    );
    const overlayComposer = createOverlayComposer(
        world,
        sceneComposer,
        surfaceComposer,
        inputsComposer,
        postProcessingComposer,
        assets
    );

    events.on( "settings-changed", ( { settings } ) => mixer.setVolumes( settings.audio ) );

    const _setSceneController = async ( controllername: string, defaultData?: any ) => {
        const sceneController = plugins.native
            .getAllSceneControllers()
            .find( ( handler ) => handler.name === controllername );

        if ( sceneController ) {
            plugins.native.activateSceneController( sceneController );
            await viewControllerComposer.activate( sceneController, defaultData );
            inputsComposer.unitSelectionBox.camera =
                viewControllerComposer.primaryCamera!;
        }
    };

    const unsetSceneController = () => {
        plugins.native.activateSceneController( undefined );
        viewControllerComposer.deactivate();
    };

    janitor.on(
        ipcRenderer,
        CLEAR_ASSET_CACHE,
        () => {
            assets.resetAssetCache();
            sceneComposer.resetImageCache();
            frameResetRequested = true;
        },
        "clear-asset-cache"
    );

    events.on( "settings-changed", ( { settings, rhs } ) => {
        if (
            rhs.input?.sceneController &&
            rhs.input.sceneController !== viewControllerComposer.sceneController?.name
        ) {
            postProcessingComposer.startTransition( () => {
                setTimeout(
                    () => _setSceneController( settings.input.sceneController ),
                    0
                );
            } );
        }
    } );

    const simpleText = janitor.mop( new SimpleText(), "simple-text" );

    const gameTimeApi: GameTimeApi = mix(
        {
            map,
            assets,
            exitScene() {
                setTimeout( () => {
                    settings.vars.input.sceneController.reset();
                }, 0 );
            },
            sandboxApi,

            refreshScene: () => ( frameResetRequested = true ),
            simpleMessage( val: string ) {
                simpleText.set( val );
            },
        },
        surfaceComposer.api,
        sceneComposer.api,
        openBwComposer.api,
        inputsComposer.api,
        viewControllerComposer.api,
        postProcessingComposer.api
    ) as GameTimeApi;

    return {
        world,

        // binding stuff we can' t do before hand
        init() {
            surfaceComposer.resize( true );

            gameLoopComposer.onUpdate( this.update.bind( this ) );

            janitor.on(
                ipcRenderer,
                RELOAD_PLUGINS,
                async () => {
                    await this.activate(
                        true,
                        settings.getState().input.sceneController
                    );
                },
                "reload-plugins"
            );
        },

        async activate(
            reloadPlugins: boolean,
            sceneController: string,
            targetData?: any
        ) {
            openBW.setGameSpeed( 1 );
            openBW.setPaused( false );
            gameLoopComposer.stop();

            if ( reloadPlugins ) {
                events.emit( "world-end" );
                unsetSceneController();
            }

            await plugins.activate( gameTimeApi, settings, reloadPlugins );

            await _setSceneController( sceneController, targetData );

            openBwComposer.precompile();
            postProcessingComposer.precompile( viewControllerComposer.primaryCamera! );

            events.emit( "resize", surfaceComposer.gameSurface );
            events.emit( "settings-changed", {
                settings: settings.getState(),
                rhs: settings.getState(),
            } );
            events.emit( "world-start" );

            window.gc!();

            gameLoopComposer.start();

            surfaceComposer.gameSurface.show();
        },

        sceneComposer,

        dispose: () => {
            events.emit( "world-end" );
            events.emit( "dispose" );
            janitor.dispose();
            surfaceComposer.gameSurface.hide();
        },

        update( delta: number, elapsed: number ) {
            if ( !viewControllerComposer.primaryViewport ) return;

            if ( frameResetRequested ) {
                events.emit( "frame-reset" );
                frameResetRequested = false;
            }

            viewControllerComposer.update( delta );

            overlayComposer.update( delta );

            inputsComposer.update(
                delta,
                elapsed,
                viewControllerComposer,
                overlayComposer
            );

            if ( openBwComposer.update( elapsed, world.openBW.nextFrame() ) ) {
                sceneComposer.onFrame(
                    delta,
                    elapsed,
                    viewControllerComposer.primaryViewport
                );

                overlayComposer.onFrame( openBwComposer.completedUpgrades );

                plugins.ui.onFrame(
                    openBW,
                    openBwComposer.currentFrame,
                    openBW._get_buffer( 8 ),
                    openBW._get_buffer( 9 ),
                    sceneComposer.selectedUnits._dangerousArray
                );

                commandsComposer.onFrame( openBwComposer.currentFrame );

                plugins.native.hook_onFrame(
                    openBwComposer.currentFrame,
                    commandsComposer.commandsThisFrame
                );
            }

            this.onRender( delta, elapsed );

            inputsComposer.reset();
        },

        onRender: ( delta: number, elapsed: number ) => {
            plugins.native.hook_onBeforeRender( delta, elapsed );

            postProcessingComposer.render( delta, elapsed );

            plugins.native.hook_onRender( delta, elapsed );
        },
    };
};
