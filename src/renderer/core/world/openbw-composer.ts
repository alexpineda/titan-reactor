import { SoundChannels } from "@audio/sound-channels";
import { skipHandler } from "@openbw/skip-handler";
import {
    REPLAY_MAX_SPEED,
    REPLAY_MIN_SPEED,
    SpeedDirection,
    speedHandler,
} from "@openbw/speed-handler";
import { buildSound } from "@utils/sound-utils";
import { floor32 } from "common/utils/conversions";
import { SceneComposer } from "./scene-composer";
import { MathUtils } from "three";
import { createCompletedUpgradesHelper } from "@openbw/completed-upgrades";
import { ViewControllerComposer } from "@core/world/view-controller-composer";
import { World } from "./world";
import { mixer } from "@core/global";
import { Timer } from "@utils/timer";
import { borrow, Borrowed } from "@utils/object-utils";
import { SimpleBufferView } from "@openbw/structs/simple-buffer-view";

export type OpenBwComposer = ReturnType<typeof createOpenBWComposer>;
export type OpenBwComposerApi = OpenBwComposer["api"];

/**
 * A lot of communication with OpenBW happens here.
 * Most importantly generates sounds, creep, and game data from the current frame our client is on.
 * 
 * @param world 
 * @param scene 
 * @param viewInput 
 * @returns 
 */
export const createOpenBWComposer = (
    world: World,
    scene: Pick<SceneComposer, "pxToWorld" | "terrainExtra">,
    viewInput: ViewControllerComposer
) => {
    let _currentFrame = 0;
    let _previousBwFrame = -1;

    const soundChannels = new SoundChannels( mixer );

    const buildSounds = ( elapsed: number ) => {
        const soundsAddr = world.openBW.getSoundsAddress();
        for ( let i = 0; i < world.openBW.getSoundsCount(); i++ ) {
            const addr = ( soundsAddr >> 2 ) + ( i << 2 );
            const typeId = world.openBW.HEAP32[addr];
            const x = world.openBW.HEAP32[addr + 1];
            const y = world.openBW.HEAP32[addr + 2];
            const unitTypeId = world.openBW.HEAP32[addr + 3];

            if ( world.fogOfWar.isVisible( floor32( x ), floor32( y ) ) && typeId !== 0 ) {
                buildSound(
                    elapsed,
                    x,
                    y,
                    typeId,
                    unitTypeId,
                    scene.pxToWorld,
                    viewInput.primaryViewport!.audioType,
                    viewInput.primaryViewport!.projectedView,
                    soundChannels
                );
            }
        }
    };

    world.events.on( "settings-changed", ( { rhs } ) => {
        if ( rhs.session?.sandbox !== undefined ) {
            return world.openBW.setSandboxMode( rhs.session.sandbox ) !== undefined;
        }
    } );

    const { resetCompletedUpgrades, updateCompletedUpgrades, completedUpgrades } =
        createCompletedUpgradesHelper(
            world.openBW,
            ( owner: number, typeId: number, level: number ) => {
                world.events.emit( "completed-upgrade", { owner, typeId, level } );
            },
            ( owner: number, typeId: number ) => {
                world.events.emit( "completed-upgrade", { owner, typeId } );
            }
        );

    world.events.on( "frame-reset", ( frame ) => {
        _currentFrame = frame;
        _previousBwFrame = -1;
        resetCompletedUpgrades( frame );
    } );

    const _tiles = new SimpleBufferView( 4, 0, 0, world.openBW.HEAPU8 );
    const buildCreep = ( frame: number ) => {
        _tiles.address = world.openBW.getTilesPtr();
        _tiles.viewSize = world.openBW.getTilesSize();
        scene.terrainExtra.creep.generate( _tiles, frame );
    };

    let lastElapsed = 0;
    const pauseTimer = new Timer();

    world.events.on( "frame-reset", () => soundChannels.reset() );

    // for game time api
    const gtapi_playSound = (
        typeId: number,
        volumeOrX?: number,
        y?: number,
        unitTypeId = -1
    ) => {
        if ( y !== undefined && volumeOrX !== undefined ) {
            buildSound(
                lastElapsed,
                volumeOrX,
                y,
                typeId,
                unitTypeId,
                scene.pxToWorld,
                viewInput.primaryViewport!.audioType,
                viewInput.primaryViewport!.projectedView,
                soundChannels
            );
        } else {
            soundChannels.playGlobal( typeId, volumeOrX );
        }
    };

    const gtapi_getCurrentFrame = () => _currentFrame;

    return {
        completedUpgrades,
        get currentFrame() {
            return _currentFrame;
        },
        get previousBwFrame() {
            return _previousBwFrame;
        },
        /**
         * Compiler shaders ahead of time
         */
        precompile() {
            world.openBW.nextFrameSafe();
            world.openBW.generateFrame();
            _tiles.address = world.openBW.getTilesPtr();
            _tiles.viewSize = world.openBW.getTilesSize();
            scene.terrainExtra.creep.generateImmediate( _tiles );
        },
        update( elapsed: number, frame: number ) {
            lastElapsed = elapsed;
            _currentFrame = frame;

            if ( frame !== _previousBwFrame ) {
                world.openBW.generateFrame();

                if ( frame % 24 === 0 ) {
                    updateCompletedUpgrades( frame );
                }

                buildSounds( elapsed );
                buildCreep( frame );

                _previousBwFrame = frame;

                return true;
            } else if ( world.openBW.isPaused() ) {
                pauseTimer.update( elapsed );

                if ( pauseTimer.getElapsed() > 42 ) {
                    pauseTimer.resetElapsed();
                    return true;
                }
            }

            return false;
        },
        // not used, kept to keep the object alive for game time api
        _refs: {
            gtapi_playSound,
            gtapi_getCurrentFrame,
        },
        api: ( (
            b_world: Borrowed<World, true>,
            _playSound: WeakRef<typeof gtapi_playSound>,
            _getCurrentFrame: WeakRef<typeof gtapi_getCurrentFrame>
        ) => ( {
            openBW: {
                getOriginal() {
                    return b_world.openBW.deref()!;
                },
                get iterators() {
                    return b_world.openBW.deref()!.iterators;
                },
                get mapTiles() {
                    return _tiles;
                },
                skipForward: skipHandler( b_world.openBW, 1, b_world.reset ),
                skipBackward: skipHandler( b_world.openBW, -1, b_world.reset ),
                speedUp: () => speedHandler( SpeedDirection.Up, b_world.openBW ),
                speedDown: () => speedHandler( SpeedDirection.Down, b_world.openBW ),
                togglePause: ( setPaused?: boolean ) => {
                    const openBW = b_world.openBW.deref()!;
                    openBW.setPaused( setPaused ?? !openBW.isPaused() );
                    return openBW.isPaused();
                },
                get gameSpeed() {
                    const openBW = b_world.openBW.deref()!;
                    return openBW.getGameSpeed();
                },
                /**
                 * Sets the game speed clamped to REPLAY_MIN_SPEED and REPLAY_MAX_SPEED
                 */
                setGameSpeed( value: number ) {
                    const openBW = b_world.openBW.deref()!;
                    openBW.setGameSpeed(
                        MathUtils.clamp( value, REPLAY_MIN_SPEED, REPLAY_MAX_SPEED )
                    );
                },
                gotoFrame: ( frame: number ) => {
                    const openBW = b_world.openBW.deref()!;
                    openBW.setCurrentReplayFrame( frame );
                    b_world.reset.deref()!();
                },
            },
            get frame() {
                return _getCurrentFrame.deref()!();
            },
            playSound( ...args: Parameters<typeof gtapi_playSound> ) {
                _playSound.deref()!( ...args );
            },
        } ) )(
            borrow<World, true>( world, { retainRefs: true } ),
            new WeakRef( gtapi_playSound ),
            new WeakRef( gtapi_getCurrentFrame )
        ),
    };
};
