import { log } from "@ipc/log";
import { renderComposer } from "@render/render-composer";
import { WorldEvents } from "./world-events";
import { TypeEmitter } from "@utils/type-emitter";

export type GameLoopComposer = ReturnType<typeof createGameLoopComposer>;
export type GameLoopComposerApi = GameLoopComposer["api"];

export const createGameLoopComposer = ( events: TypeEmitter<WorldEvents> ) => {
    let delta = 0;
    let lastElapsed = 0;
    let _onUpdate: ( delta: number, elapsed: number ) => void = () => {};

    // the < 0 stuff is due to a bug when WebXR is entering/exiting
    const GAME_LOOP = ( elapsed: number ) => {
        if (elapsed < 0) { 
            console.error( "Negative elapsed time detected. Skipping frame." );
            return;
        }
        delta = elapsed - lastElapsed;
        lastElapsed = elapsed;

        _onUpdate( delta < 0 ? 0 : delta, elapsed );
    };

    events.on( "dispose", () => {
        log.debug( "dispose game loop" );
        renderComposer.setAnimationLoop( null );
    } );

    return {
        get delta() {
            return delta;
        },
        start() {
            renderComposer.setAnimationLoop( GAME_LOOP );
        },
        stop() {
            renderComposer.setAnimationLoop( null );
        },
        onUpdate( val: ( delta: number, elapsed: number ) => void ) {
            _onUpdate = val;
        },
        api: {
            get elapsed() {
                return lastElapsed;
            },
            get delta() {
                return delta;
            }
        }
    };
};
