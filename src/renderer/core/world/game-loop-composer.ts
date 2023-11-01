import { log } from "@ipc/log";
import { renderComposer } from "@render/render-composer";
import { World } from "./world";

export type GameLoopComposer = ReturnType<typeof createGameLoopComposer>;
export type GameLoopComposerApi = GameLoopComposer["api"];

export const createGameLoopComposer = ( world: World ) => {
    let delta = 0;
    let lastElapsed = 0;
    let _onUpdate: ( delta: number, elapsed: number ) => void = () => {};

    const GAME_LOOP = ( elapsed: number ) => {
        if (elapsed < 0) { 
            console.error( "Negative elapsed time detected. Skipping frame." );
            return;
        }
        delta = elapsed - lastElapsed;
        lastElapsed = elapsed;

        _onUpdate( delta, elapsed );
    };

    world.events.on( "dispose", () => {
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
