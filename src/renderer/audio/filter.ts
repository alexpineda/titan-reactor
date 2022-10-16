import { MainMixer } from "./main-mixer";

export class Filter {
    node: BiquadFilterNode;
    #mixer: WeakRef<MainMixer>;

    get mixer() {
        return this.#mixer.deref()!;
    }

    constructor( mixer: MainMixer, type: BiquadFilterType, frequency = 84 ) {
        this.#mixer = new WeakRef( mixer );
        this.node = mixer.context.createBiquadFilter();
        this.node.type = type;
        this.changeFrequency( frequency );
    }

    /** 33-140 */
    changeFrequency( frequency: number ) {
        // this helps us perceive the sound as being linear
        this.node.frequency.setValueAtTime(
            Math.pow( 2, frequency / 10 ),
            this.mixer.context.currentTime
        );
    }

    // +- 100
    changeDetune( detune: number ) {
        this.node.detune.setValueAtTime( detune, this.mixer.context.currentTime );
    }

    // +- 40
    changeQ( Q: number ) {
        this.node.Q.setValueAtTime(
            Math.pow( 10, Q / 10 ),
            this.mixer.context.currentTime
        );
    }

    //+-40
    changeGain( gain: number ) {
        this.node.gain.setValueAtTime( gain, this.mixer.context.currentTime );
    }
}
