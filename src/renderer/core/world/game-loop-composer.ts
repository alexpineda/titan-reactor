import { renderComposer } from "@render/render-composer";

export const createGameLoopComposer = () => {

    let delta = 0;
    let lastElapsed = 0;
    let _onUpdate: (delta: number, elapsed: number) => void = () => { };

    const GAME_LOOP = (elapsed: number) => {

        delta = elapsed - lastElapsed;
        lastElapsed = elapsed;

        _onUpdate(delta, elapsed);

    };

    return {

        get delta() {
            return delta;
        },
        start() {
            renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);
        },
        stop() {
            renderComposer.getWebGLRenderer().setAnimationLoop(null);
        },
        onUpdate(val: (delta: number, elapsed: number) => void) {
            _onUpdate = val;
        },
        dispose() {
            this.stop();
        }


    }
}