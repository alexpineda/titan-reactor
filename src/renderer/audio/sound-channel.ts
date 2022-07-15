import { Vector3 } from "three";
import MainMixer from "./main-mixer";

// an instance of a bw sound
export class SoundChannel {
  static rolloffFactor = 1;
  static refDistance = 10;

  #mixer: MainMixer;
  #gain: GainNode;

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

  #pannerPool: PannerNode[] = [];
  #stereoPannerPool: StereoPannerNode[] = [];

  constructor(mixer: MainMixer) {
    this.#mixer = mixer;
    this.#gain = this.#mixer.context.createGain();

    this.#gain.connect(this.#mixer.sound);
  }

  #getStereoPanner() {
    if (this.#stereoPannerPool.length > 0) {
      return this.#stereoPannerPool.pop() as StereoPannerNode;
    }
    const panner = this.#mixer.context.createStereoPanner();
    panner.connect(this.#gain);
    return panner;
  }

  #getPanner() {
    if (this.#pannerPool.length > 0) {
      return this.#pannerPool.pop() as PannerNode;
    }
    const panner = this.#mixer.context.createPanner();
    panner.connect(this.#gain);
    return panner;
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



    if (this.volume !== null && this.pan !== null) {
      const panner = this.#getStereoPanner();
      source.connect(panner);
      panner.pan.value = this.pan;

      source.onended = () => {
        source.disconnect(panner);
        this.#stereoPannerPool.push(panner);
        this.isPlaying = false;
      };

    } else {
      const panner = this.#getPanner();
      source.connect(panner);

      panner.panningModel = "HRTF";
      panner.refDistance = SoundChannel.refDistance;
      panner.rolloffFactor = SoundChannel.rolloffFactor;
      panner.distanceModel = "inverse";

      panner.positionX.value = this.mapCoords.x;
      panner.positionY.value = this.mapCoords.y;
      panner.positionZ.value = this.mapCoords.z;

      source.onended = () => {
        source.disconnect(panner);
        this.#pannerPool.push(panner);
        this.isPlaying = false;
      };
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
