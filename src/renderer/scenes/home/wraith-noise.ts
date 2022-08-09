import { Filter } from "@audio/filter";
import { mixer } from "@audio/main-mixer";
import Janitor from "@utils/janitor";
import { MathUtils } from "three";

export const createWraithNoise = () => {
    const { source: highNoise, gain: highGain } = mixer.noise();
    const { source: noise, gain } = mixer.noise();

    const lopassFilter = new Filter("lowpass", 10);
    noise.detune.value = -800;
    gain.gain.value = 0.5;

    highNoise.detune.value = -400;
    highGain.gain.value = 0;

    const highpassFilter = new Filter("highpass", 10);
    highpassFilter.changeDetune(8000);

    const janitor = new Janitor(
        mixer.connect(
            highGain,
            gain,
            lopassFilter.node,
            highpassFilter.node,
            mixer.createDistortion(50),
            mixer.createGain(0.5),
            mixer.intro
        )
    );
    gain.connect(highGain.gain);

    let _isPlaying = false;
    return {
        get isPlaying() {
            return _isPlaying;
        },
        start() {
            _isPlaying = true;
            noise.start();
            highNoise.start();
        },
        set value(val: number) {
            const h = MathUtils.lerp(0.75, 1, val);

            gain.gain.value = 0.5 * h;
            lopassFilter.changeFrequency(h * 60 + 10);

            const r = 1 - Math.pow(val, 4);
            const t = 1 - Math.pow(val, 8);
            highpassFilter.changeFrequency(r * 10);
            highpassFilter.changeDetune(MathUtils.lerp(-4000, 8000, t));
        },
        dispose() {
            if (_isPlaying) {
                noise.stop();
                highNoise.stop();
            }

            janitor.mopUp();
        },
    };
};
export type WraithNoise = ReturnType<typeof createWraithNoise>;