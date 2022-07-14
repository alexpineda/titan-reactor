import { Vector3 } from "three";
import MainMixer from "./main-mixer";

const stopTime = 30; //ms

// an instance of a bw sound
export class SoundChannel {
  static rolloffFactor = 1;
  static refDistance = 10;

  #mixer: MainMixer;
  #gain: GainNode;
  #stereoPanner: StereoPannerNode;
  #panner: PannerNode;

  isPlaying = false;
  isQueued = false;
  lastPlayed = 0;

  // sound data
  buffer?: AudioBufferSourceNode;
  mapCoords = new Vector3;
  volume: number | null = null;
  pan: number | null = null;
  flags = 0;
  priority = 0;
  typeId = 0;
  unitTypeId = -1;


  constructor(mixer: MainMixer) {
    this.#mixer = mixer;
    this.#gain = this.#mixer.context.createGain();
    this.#stereoPanner = this.#mixer.context.createStereoPanner();
    this.#panner = this.#mixer.context.createPanner();

    this.#gain.connect(this.#mixer.sound);
    this.#panner.connect(this.#gain);
    this.#stereoPanner.connect(this.#gain);

  }

  queue(typeId: number, unitTypeId: number, mapCoords: Vector3, flags: number, priority: number, volume: number | null, pan: number | null) {
    this.isQueued = true;
    this.typeId = typeId;
    this.unitTypeId = unitTypeId;
    this.mapCoords.copy(mapCoords);
    this.volume = volume;
    this.pan = pan;
    this.flags = flags;
    this.priority = priority;
  }

  play(elapsed: number, buffer: AudioBuffer) {
    this.isPlaying = true;
    this.isQueued = false;
    this.lastPlayed = elapsed;

    // quick fade in since some sounds are clipping at the start (eg probe harvest)
    this.#gain.gain.value = 0;
    this.#gain.gain.linearRampToValueAtTime(Math.min(0.99, this.volume !== null ? this.volume / 100 : 1), this.#mixer.context.currentTime + 0.01);

    const source = this.#mixer.context.createBufferSource();
    source.buffer = buffer;

    source.onended = () => {
      this.isPlaying = false;
    };

    if (this.volume !== null && this.pan !== null) {
      source.connect(this.#stereoPanner);
      this.#stereoPanner.pan.value = this.pan;
    } else {
      source.connect(this.#panner);

      this.#panner.panningModel = "HRTF";
      this.#panner.refDistance = SoundChannel.refDistance;
      this.#panner.rolloffFactor = SoundChannel.rolloffFactor;
      this.#panner.distanceModel = "inverse";

      this.#panner.positionX.value = this.mapCoords.x;
      this.#panner.positionY.value = this.mapCoords.y;
      this.#panner.positionZ.value = this.mapCoords.z;
    }

    source.start(0);
    this.isPlaying = true;
  }

  // // https://alemangui.github.io/ramp-to-value
  // stop() {
  //   this.isPlaying = false;

  //   this.#gain.gain.setValueAtTime(
  //     this.#gain.gain.value,
  //     this.#mixer.context.currentTime
  //   );
  //   this.#gain.gain.exponentialRampToValueAtTime(
  //     0.0001,
  //     this.#mixer.context.currentTime + stopTime * 0.001
  //   );
  // }
}
export default SoundChannel;
