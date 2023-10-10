import { OpenBW } from "@openbw/openbw";
import { Assets } from "@image/assets";
import { Janitor } from "three-janitor";
import { ApiSession } from "./api-session";
import { createSettingsSessionStore } from "./settings-session-store";
import { GameTimeApi } from "./game-time-api";
import Chk from "bw-chk";
import { SimpleText } from "@render/simple-text";
import { createSandboxApi } from "@openbw/sandbox-api";
import { createSceneComposer } from "./scene-composer";
import { createPostProcessingComposer } from "./postprocessing-composer";
import { BasePlayer, Players } from "../players";
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
import { settingsStore } from "@stores/settings-store";
import { globalEvents } from "@core/global-events";
import { Vector3 } from "three";

export const createWorldComposer = async (
    openBW: OpenBW,
    assets: Assets,
    map: Chk,
    //todo: rename to Map Player
    basePlayers: BasePlayer[],
    commands: CommandsStream
) => {
    const janitor = new Janitor( "WorldComposer" );
    const events = janitor.mop( new TypeEmitter<WorldEvents>(), "events" );
    const settings = janitor.mop( createSettingsSessionStore( events ) );

    const fogOfWarEffect = janitor.mop( new FogOfWarEffect(), "FogOfWarEffect" );
    const fogOfWar = new FogOfWar( map.size[0], map.size[1], openBW, fogOfWarEffect );

    const world: World = {
        openBW,
        map,
        players: new Players( basePlayers ),
        commands,
        fogOfWar,
        fogOfWarEffect,
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
        viewControllerComposer,
        assets
    );

    let apiSession = new ApiSession();

    events.on( "settings-changed", ( { settings } ) => mixer.setVolumes( settings.audio ) );

    const _setSceneController = async ( controllername: string, defaultData?: any ) => {
        const sceneController = apiSession.native
            .getAllSceneControllers()
            .find( ( handler ) => handler.name === controllername );

        if ( sceneController ) {
            apiSession.native.activateSceneController( sceneController );
            await viewControllerComposer.activate( sceneController, defaultData );
            inputsComposer.unitSelectionBox.camera =
                viewControllerComposer.primaryCamera!;
        }
    };

    const unsetSceneController = () => {
        apiSession.native.activateSceneController( undefined );
        viewControllerComposer.deactivate();
    };

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

    /**
     * The api that is passed to the plugins and macros.
     */
    const gameTimeApi: GameTimeApi = mix(
        {
            map,
            getCommands () {
                return commands.copy();
            },
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
        postProcessingComposer.api,
        overlayComposer.api
    ) as GameTimeApi;

    return {
        world,

        /**
         * Must be called before any other calls on world composer.
         */
        init() {
            surfaceComposer.resize( true );

            gameLoopComposer.onUpdate( this.update.bind( this ) );

            janitor.mop(
                globalEvents.on( "reload-all-plugins", async () => {
                    await settingsStore().load();
                    this.activate( true, settings.getState().input.sceneController );
                } )
            );
        },

        /**
         * Activate the world and start the game loop.
         * 
         * @param reloadPlugins
         * @param sceneController 
         * @param targetData 
         */
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

                apiSession.dispose();
                apiSession = new ApiSession();
            }

            await apiSession.activate( events, settings, openBW, gameTimeApi );

            await _setSceneController( sceneController, targetData );

            openBwComposer.precompile();
            postProcessingComposer.precompile( viewControllerComposer.primaryCamera! );

            events.emit( "resize", surfaceComposer.gameSurface );
            events.emit( "settings-changed", {
                settings: settings.getState(),
                rhs: settings.getState(),
            } );
            events.emit( "world-start" );

            if ( window.gc ) {
                window.gc();
            }

            gameLoopComposer.start();

            
        },

        surfaceComposer,
        sceneComposer,

        dispose: () => {
            events.emit( "world-end" );
            events.emit( "dispose" );
            janitor.dispose();
            surfaceComposer.gameSurface.hide();
        },

        /**
         * Runs every render frame
         * @param delta ms since last frame
         * @param elapsed ms since game start
         * @returns
         */
        update( delta: number, elapsed: number ) {
            if ( !viewControllerComposer.primaryViewport ) return;

            if ( frameResetRequested ) {
                events.emit( "frame-reset", world.openBW.getCurrentReplayFrame() );
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

            if ( openBwComposer.update( elapsed, world.openBW.nextFrameSafe() ) ) {
                sceneComposer.onFrame(
                    delta,
                    elapsed,
                    viewControllerComposer.primaryViewport
                );

                overlayComposer.onFrame( openBwComposer.completedUpgrades );

                apiSession.ui.onFrame(
                    openBwComposer.currentFrame,
                    sceneComposer.selectedUnits._dangerousArray
                );

                commandsComposer.onFrame( openBwComposer.currentFrame );

                apiSession.native.hook_onFrame(
                    openBwComposer.currentFrame,
                    commandsComposer.commandsThisFrame
                );
            }

            this.onRender( delta, elapsed );

            inputsComposer.reset();
        },

        onRender: ( delta: number, elapsed: number ) => {
            apiSession.native.hook_onBeforeRender( delta, elapsed );

            postProcessingComposer.render( delta, elapsed );

            apiSession.native.hook_onRender( delta, elapsed );
        },

        getBestStartLocation() {
            const playerWithStartLocation = world.players.find(p => p.startLocation);
            return playerWithStartLocation ? playerWithStartLocation.startLocation : sceneComposer.startLocations[0] ?? new Vector3();
        }
    };
};
