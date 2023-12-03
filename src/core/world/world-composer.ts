import { OpenBW } from "@openbw/openbw";
import { Assets } from "@image/assets";
import { Janitor } from "three-janitor";
import { ApiSession } from "./api-session";
import { createSettingsSessionStore } from "./settings-session-store";
import { GameTimeApi } from "./game-time-api";
import { SimpleText } from "@render/simple-text";
import { createSandboxApi } from "@openbw/sandbox-api";
import { createSceneComposer } from "./scene-composer";
import { createPostProcessingComposer } from "./postprocessing-composer";
import { BasePlayer, Players } from "../players";
import { FogOfWar, FogOfWarEffect } from "../fogofwar";
import { createSurfaceComposer } from "./surface-composer";
import { createOpenBWComposer } from "./openbw-composer";
import { createOverlayComposer } from "./overlay-composer";
import { createCommandsComposer } from "./commands-composer";
import { createGameLoopComposer } from "./game-loop-composer";
import { createViewControllerComposer } from "./view-controller-composer";
import { TypeEmitter } from "@utils/type-emitter";
import { World } from "./world";
import { mix } from "@utils/object-utils";
import { WorldEvents } from "./world-events";
import { createInputComposer } from "./input-composer";
import { settingsStore } from "@stores/settings-store";
import { globalEvents } from "@core/global-events";
import { createSelectionDisplayComposer } from "@core/selection-objects";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { mixer } from "@audio/main-mixer";
import { CommandsStream } from "process-replay";
import { log } from "@ipc/log";
import { pluginsStore } from "@stores/plugins-store";
import { unitTypes } from "common/enums";
import { makePxToWorld } from "common/utils/conversions";
import { getMapTiles } from "@utils/chk-utils";
import { terrainComposer } from "@image/generate-map/terrain-composer";
import { UnitTileScale } from "common/types";
import { Vector3 } from "three";

export type WorldComposer = Awaited<ReturnType<typeof createWorldComposer>>;

export const createWorldComposer = async (
    openBW: OpenBW,
    assets: Assets,
    //todo: rename to Map Player
    basePlayers: BasePlayer[],
    commands: CommandsStream
) => {
    const janitor = new Janitor( "WorldComposer" );
    const events = janitor.mop( new TypeEmitter<WorldEvents>(), "events" );
    const settings = janitor.mop( createSettingsSessionStore( events ) );

    const map = useReplayAndMapStore.getState().map!;
    const replay = useReplayAndMapStore.getState().replay;

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

    log.info( "creating composers" );

    const { terrain, ...terrainExtra } = janitor.mop(
        await terrainComposer(
            ...world.map.size,
            world.map.tileset,
            getMapTiles( world.map ),
            UnitTileScale.HD
        ),
        "terrain"
    );
    const pxToWorld = makePxToWorld( ...world.map.size, terrain.getTerrainY );
    const pxToWorldFlat = makePxToWorld( ...world.map.size, () => 0);
    const pxToWorldInverse = makePxToWorld( ...world.map.size, terrain.getTerrainY, true );

    const startLocations = world.map.units
    .filter( ( u ) => u.unitId === unitTypes.startLocation )
    .map( ( u ) => {
        const location = pxToWorld.xyz( u.x, u.y, new Vector3() );

        const player = world.players.find( ( p ) => p.id === u.player );
        if ( player ) {
            player.startLocation = (new Vector3).copy( location );
        }

        return location
    })   

    const playerWithStartLocation = world.players.find(p => p.startLocation);
    const initialStartLocation = playerWithStartLocation ? playerWithStartLocation.startLocation ?? new Vector3() : startLocations[0] ?? new Vector3();

    const gameLoopComposer = createGameLoopComposer( events );
    const surfaceComposer = createSurfaceComposer( map, events );
    const viewControllerComposer = createViewControllerComposer( world, surfaceComposer, initialStartLocation );
    const sceneComposer = await createSceneComposer( world, assets, viewControllerComposer, { terrain, heightMaps: terrainExtra.heightMaps, pxToWorld } );
    const commandsComposer = createCommandsComposer( events, commands );
    const inputsComposer = createInputComposer( world, sceneComposer );
    const sandboxApi = createSandboxApi( world, pxToWorldInverse );
    const openBwComposer = createOpenBWComposer(
        world,
        pxToWorld,
        terrainExtra.creep,
        viewControllerComposer
    );

    const postProcessingComposer = createPostProcessingComposer(
        world,
        sceneComposer,
        viewControllerComposer,
        terrain,
        assets
    );
    const overlayComposer = createOverlayComposer(
        world,
        sceneComposer,
        surfaceComposer,
        inputsComposer,
        postProcessingComposer,
        viewControllerComposer,
        terrainExtra.creep,
        terrainExtra.minimapTex,
        assets
    );

    const unitSelectionComposer = createSelectionDisplayComposer( assets );
    sceneComposer.scene.add( unitSelectionComposer.group );

    let apiSession = new ApiSession();

    events.on( "settings-changed", ( { settings } ) => mixer.setVolumes( settings.audio ) );

    const _setSceneController = async ( controllername: string, isWebXR: boolean  ) => {
        const sceneController = apiSession.native
            .getAllSceneControllers()
            .find( ( handler ) => handler.name === controllername && handler.isWebXR === isWebXR );

        if ( sceneController ) {
            apiSession.native.activateSceneController( sceneController );
            if (viewControllerComposer.sceneController) {
                apiSession.ui.deactivatePlugin( viewControllerComposer.sceneController.name );
            }
            await viewControllerComposer.activate( sceneController);
            apiSession.ui.activatePlugins( pluginsStore().plugins.filter( p => p.name === sceneController.name ) );
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
            if ( !viewControllerComposer.sceneController?.isWebXR) {
                postProcessingComposer.startTransition( () => {
                    setTimeout(
                        () => _setSceneController( settings.input.sceneController, false ),
                        0
                    );
                } );
            }
        }

        if (
            rhs.input?.vrController &&
            rhs.input.vrController !== viewControllerComposer.sceneController?.name
        ) {
            if ( viewControllerComposer.sceneController?.isWebXR ) {
                _setSceneController( settings.input.vrController, true )
            }
        }
    } );

    janitor.mop(
        globalEvents.on( "xr-session-start", async () => {
            console.log("xr-session-start")
            _setSceneController( settingsStore().data.input.vrController, true );
        } )
    );

    janitor.mop(
        globalEvents.on( "xr-session-end",  () => {
            postProcessingComposer.startTransition( () => {
                setTimeout(
                    () => _setSceneController( settingsStore().data.input.sceneController, false ),
                    0
                );
            } );
        } )
    )


    const simpleText = janitor.mop( new SimpleText(), "simple-text" );

    log.info( "creating GameTimeApi" );

    /**
     * The api that is passed to the plugins and macros.
     */
    const gameTimeApi: GameTimeApi = mix(
        {
            map,
            replay,
            getCommands() {
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
            initialStartLocation,
            startLocations,
            pxToWorld,
            pxToWorldFlat,
            pxToWorldInverse,
            terrain,
            terrainExtra
        },
        surfaceComposer.api,
        sceneComposer.api,
        openBwComposer.api,
        inputsComposer.api,
        viewControllerComposer.api,
        postProcessingComposer.api,
        overlayComposer.api,
        gameLoopComposer.api
    ) as GameTimeApi;

    log.info( "world created" );

    return {
        world,
        apiSession,

        /**
         * Must be called before any other calls on world composer.
         */
        async init() {
            surfaceComposer.resize( true );

            gameLoopComposer.onUpdate( this.update.bind( this ) );

            janitor.mop(
                globalEvents.on( "reload-all-plugins", async () => {
                    await settingsStore().init();
                    this.activate( true );
                } )
            );

            

            await apiSession.activate( world, gameTimeApi );
        },

        /**
         * Activate the world and start the game loop.
         *
         * @param reloadPlugins
         */
        async activate(
            reloadPlugins: boolean
        ) {
            openBW.setGameSpeed( 1 );
            openBW.setPaused( false );
            gameLoopComposer.stop();

            if ( reloadPlugins ) {
                events.emit( "world-end" );
                unsetSceneController();

                apiSession.dispose();
                apiSession = new ApiSession();

                await apiSession.activate( world, gameTimeApi );
            }

            await _setSceneController( settingsStore().data.input.sceneController, false );

            openBwComposer.precompile();
            postProcessingComposer.precompile( viewControllerComposer.primaryCamera );

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
            apiSession.dispose();
            janitor.dispose();
        },

        /**
         * Runs every render frame
         * @param delta ms since last frame
         * @param elapsed ms since game start
         * @returns
         */
        update( delta: number, elapsed: number ) {
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

            if ( openBwComposer.update( elapsed, world.openBW.nextFrame() ) ) {
                sceneComposer.onFrame(
                    delta,
                    viewControllerComposer.primaryViewport.renderMode3D
                );

                unitSelectionComposer.update(
                    sceneComposer.sprites,
                    openBwComposer.completedUpgrades,
                    sceneComposer.selectedUnits._dangerousArray
                );
                overlayComposer.onFrame();

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

            apiSession.native.hook_onTick(
                delta,
                elapsed
            )

            postProcessingComposer.render( delta, elapsed );

            inputsComposer.reset();
        },

        preRunObject: {
            frame: 0,
            commands: [] as unknown[],
        },
        // the game is run once through openbw at 64x speed for analysis plugins
        preRunFrame() {
            commandsComposer.onFrame( world.openBW.getCurrentReplayFrame() );

            this.preRunObject.frame = openBwComposer.currentFrame;
            this.preRunObject.commands = commandsComposer.commandsThisFrame;

            world.events.emit( "pre-run:frame", this.preRunObject );
        },

        preRunComplete() {
            commandsComposer.reset();
            world.events.emit( "pre-run:complete" );
        },

    };
};
