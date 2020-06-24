import * as R from 'ramda';

export default class BroodwarClock {
    constructor(maxFrame) {
        this.maxFrame = maxFrame;
        this.enabled = false;
    }

    restart() {
        this.enabled = true;
        this.frame = 0;
    }

    pause() {
        this.enabled = false;
    }

    resume() {
        if (this.frame == this.maxFrame) return;
        this.enabled = true;
    }

    isCompleted() {
        return this.frame == this.maxFrame;
    }

    /* will probably want to return a range of frames*/
    update(delta) {
        if (!this.enabled) return [];

        const oldFrame = this.frame;
        this.frame = Math.min(this.frame + 10, this.maxFrame);

        if (this.frame == this.maxFrame) {
            this.pause();
        }

        this.elapsedFrames = R.range(oldFrame + 1,this.frame);
        return this.elapsedFrames;
    }
}
