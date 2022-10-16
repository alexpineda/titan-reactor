import { log } from "@ipc/log";
import { renderComposer } from "@render/render-composer";
import { World } from "./world";

export const createGameLoopComposer = ( world: World ) => {
    let delta = 0;
    let lastElapsed = 0;
    let _onUpdate: ( delta: number, elapsed: number ) => void = () => {};

    const GAME_LOOP = ( elapsed: number ) => {
        delta = elapsed - lastElapsed;
        lastElapsed = elapsed;

        _onUpdate( delta, elapsed );
    };

    world.events.on( "dispose", () => {
        log.debug( "dispose game loop" );
        renderComposer.getWebGLRenderer().setAnimationLoop( null );
    } );

    return {
        get delta() {
            return delta;
        },
        start() {
            renderComposer.getWebGLRenderer().setAnimationLoop( GAME_LOOP );
        },
        stop() {
            renderComposer.getWebGLRenderer().setAnimationLoop( null );
        },
        onUpdate( val: ( delta: number, elapsed: number ) => void ) {
            _onUpdate = val;
        },
    };
};
