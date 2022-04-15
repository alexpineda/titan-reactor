/**
 * https://github.com/vanruesc/postprocessing/blob/main/manual/js/src/utils/FPSMeter.js
 */

export default class FPSMeter {

    fps = "0";
    timestamp = 0;
    acc = 0;
    frames = 0;

    update(timestamp: number) {

        this.acc += timestamp - this.timestamp;
        this.timestamp = timestamp;

        if (this.acc >= 1e3) {

            this.fps = this.frames.toFixed(0);
            this.acc = 0.0;
            this.frames = 0;

        } else {

            ++this.frames;

        }

    }

}
