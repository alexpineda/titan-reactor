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



const _wraithSounds = [
    "tphrdy00.wav",
    "tphwht00.wav",
    "tphwht01.wav",
    "tphwht02.wav",
    "tphwht03.wav",
    "tphyes00.wav",
    "tphyes01.wav",
    "tphyes02.wav",
    "tphyes03.wav",
    "tphpss00.wav",
    "tphpss01.wav",
    "tphpss02.wav",
    "tphpss03.wav",
    "tphpss05.wav",
    "tphpss06.wav",
].map((s) => `casc:sound\\terran\\phoenix\\${s}`);

export const playWraithComms = async (rear: number) => {
    const sound = mixer.context.createBufferSource();
    sound.buffer = await mixer.loadAudioBuffer(
        _wraithSounds[MathUtils.randInt(0, _wraithSounds.length - 1)]
    );
    sound.detune.value = -200 * rear;

    const filter = new Filter("bandpass", 40);
    filter.changeQ(3);
    filter.changeGain(2);

    const janitor = new Janitor(
        mixer.connect(sound, filter.node, mixer.createGain(2), mixer.intro)
    );
    sound.start();
    sound.onended = () => janitor.mopUp();
}

export const playRemix = async () => {
    const sound = mixer.context.createBufferSource();
    sound.buffer = await mixer.loadAudioBuffer(
        `${__static}/remix.ogg`
    );

    sound.detune.setValueAtTime(-200, mixer.context.currentTime + 0.01);
    sound.detune.setValueAtTime(0, mixer.context.currentTime + 1);
    sound.detune.setTargetAtTime(-200, mixer.context.currentTime + 12, 0.01);


    const lopass = new Filter("highpass", 60);

    const filter = new Filter("bandpass", 40);
    filter.changeQ(4);
    filter.changeGain(4);

    const lfo = mixer.context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 440;
    lfo.connect(filter.node.frequency);

    const gain = mixer.createGain(4)
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(4, mixer.context.currentTime, 1);
    gain.gain.setTargetAtTime(0, mixer.context.currentTime + 13, 0.5);

    const janitor = new Janitor(
        mixer.connect(sound, lopass.node, filter.node, mixer.createDistortion(2), gain, mixer.intro)
    );
    sound.start();
    sound.onended = () => janitor.mopUp();
}