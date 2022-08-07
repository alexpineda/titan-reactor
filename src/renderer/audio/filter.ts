import { mixer } from "./main-mixer";

export class Filter {
    node: BiquadFilterNode;

    constructor() {
        this.node = mixer.context.createBiquadFilter();
        this.node.type = "lowpass";
        this.changeFrequency(84);
    }

    /** 33-140 */
    changeFrequency(frequency: number) {
        // this helps us perceive the sound as being linear
        this.node.frequency.setValueAtTime(
            Math.pow(2, frequency / 10),
            mixer.context.currentTime
        );
    }

    // +- 100
    changeDetune(detune: number) {
        this.node.detune.setValueAtTime(
            detune,
            mixer.context.currentTime
        );
    };

    // +- 40
    changeQ(Q: number) {
        this.node.Q.setValueAtTime(
            Math.pow(10, Q / 10),
            mixer.context.currentTime
        );
    };

    //+-40
    changeGain(gain: number) {
        this.node.gain.setValueAtTime(
            gain,
            mixer.context.currentTime
        );
    };
}