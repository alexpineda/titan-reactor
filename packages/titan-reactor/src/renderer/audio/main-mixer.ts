import { AudioContext } from "three";

const MUSIC_REDUCTION_RATIO = 0.1;

// mixes sound and music volumes
export class MainMixer {
  context: AudioContext;
  master: GainNode;
  compressor: DynamicsCompressorNode;
  sound: GainNode;
  music: GainNode;

  constructor() {
    this.context = AudioContext.getContext();

    this.master = this.context.createGain();
    this.master.connect(this.context.destination);

    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.connect(this.master);

    this.sound = this.context.createGain();
    this.sound.connect(this.compressor);

    this.music = this.context.createGain();
    this.music.connect(this.compressor);
  }

  // compatibility with THREE.Audio until we change BgMusic
  getInput() {
    return this.music;
  }

  get masterVolume() {
    return this.master.gain.value;
  }

  set masterVolume(val) {
    this.master.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get soundVolume() {
    return this.sound.gain.value;
  }

  set soundVolume(val) {
    this.sound.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get musicVolume() {
    return this.music.gain.value;
  }

  set musicVolume(val) {
    this.music.gain.setTargetAtTime(val * MUSIC_REDUCTION_RATIO, this.context.currentTime, 0.01);
  }

  update(x: number, y: number, z: number, delta: number) {
    const endTime = this.context.currentTime + delta * 0.001;
    this.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }
}

export default MainMixer;
