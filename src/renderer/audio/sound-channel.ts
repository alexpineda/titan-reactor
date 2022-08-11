import { Vector3 } from "three";
import { mixer } from "./main-mixer";

export class SoundChannel {
  static rolloffFactor = 1;
  static refDistance = 10;

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
  #gainPool: GainNode[] = [];

  #getStereoPanner() {
    if (this.#stereoPannerPool.length > 0) {
      return this.#stereoPannerPool.pop() as StereoPannerNode;
    }
    const panner = mixer.context.createStereoPanner();
    return panner;
  }

  #getPanner() {
    if (this.#pannerPool.length > 0) {
      return this.#pannerPool.pop() as PannerNode;
    }
    const panner = mixer.context.createPanner();
    return panner;
  }

  #getGain() {
    if (this.#gainPool.length > 0) {
      return this.#gainPool.pop() as GainNode;
    }
    const gain = mixer.context.createGain();
    gain.connect(mixer.sound);
    return gain
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
    const gain = this.#getGain()
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(Math.min(0.99, this.volume !== null ? this.volume / 100 : 1), mixer.context.currentTime + 0.01);

    const source = mixer.context.createBufferSource();
    source.buffer = buffer;

    if (this.volume !== null && this.pan !== null) {
      const panner = this.#getStereoPanner();
      source.connect(panner);
      panner.connect(gain);
      panner.pan.value = this.pan;

      source.onended = () => {
        source.disconnect(panner);
        panner.disconnect(gain);
        this.#stereoPannerPool.push(panner);
        this.#gainPool.push(gain);
        this.isPlaying = false;
      };

    } else {
      const panner = this.#getPanner();
      source.connect(panner);
      panner.connect(gain);

      panner.panningModel = "HRTF";
      panner.refDistance = SoundChannel.refDistance;
      panner.rolloffFactor = SoundChannel.rolloffFactor;
      panner.distanceModel = "inverse";

      panner.positionX.value = this.mapCoords.x;
      panner.positionY.value = this.mapCoords.y;
      panner.positionZ.value = this.mapCoords.z;

      source.onended = () => {
        source.disconnect(panner);
        panner.disconnect(gain);
        this.#gainPool.push(gain);
        this.#pannerPool.push(panner);
        this.isPlaying = false;
      };
    }

    source.start(0);
    this.isPlaying = true;
  }

}
export default SoundChannel;
