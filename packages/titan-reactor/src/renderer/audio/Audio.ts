import { SoundDAT } from "../../common/types";
import { SoundRAW } from "../integration/sound-raw";
import DeferredAudioBuffer from "./deferred-audio-buffer";
import MainMixer from "./main-mixer";

const stopTime = 30; //ms

// an instance of a bw sound
export class Audio {
  mixer: MainMixer;
  buffer: DeferredAudioBuffer;
  isPlaying = false;
  queueStartTime = 0;
  source?: AudioBufferSourceNode;
  gain?: GainNode;
  sound: SoundRAW;
  dat: SoundDAT;

  constructor(mixer: MainMixer, sound: SoundRAW, buffer: DeferredAudioBuffer, soundDat: SoundDAT) {
    this.mixer = mixer;
    this.buffer = buffer;
    this.sound = sound;
    this.dat = soundDat;
  }

  queue(elapsed: number) {
    if (this.source) return;
    this.isPlaying = true;
    this.buffer.lastPlayed = elapsed;
    this.queueStartTime = elapsed;
  }

  play(elapsed: number) {
    if (!this.buffer.buffer) return;
    const offset = (elapsed - this.queueStartTime) * 0.001;
    if (this.source || offset > this.buffer.buffer.duration) return;

    const source = this.mixer.context.createBufferSource();

    const gain = this.mixer.context.createGain();

    const volume = 1;

    const panner = this.mixer.context.createPanner();
    panner.panningModel = "HRTF";

    panner.refDistance = 20;
    panner.rolloffFactor = 0.5;
    panner.distanceModel = "inverse";

    // panner.positionX.value = this.sound.mapX;
    // panner.positionY.value = this.sound.mapY;
    // panner.positionZ.value = this.sound.mapZ;

    source.buffer = this.buffer.buffer;

    gain.connect(this.mixer.sound);
    panner.connect(gain);
    source.connect(panner);

    source.onended = () => {
      this.isPlaying = false;
    };
    gain.gain.setValueAtTime(
      Math.min(0.99, volume),
      this.mixer.context.currentTime
    );
    source.start(0);
    // gain.gain.exponentialRampToValueAtTime(
    //   volume,
    //   this.mixer.context.currentTime + offset
    // );
    this.buffer.lastPlayed = elapsed;
    this.source = source;
    this.gain = gain;
    this.isPlaying = true;
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    this.isPlaying = false;

    if (!this.source || !this.gain) {
      return;
    }

    this.gain.gain.setValueAtTime(
      this.gain.gain.value,
      this.mixer.context.currentTime
    );
    this.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.mixer.context.currentTime + stopTime * 0.001
    );
    this.source.onended = null;
  }
}
export default Audio;
