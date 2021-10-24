import { AudioContext } from "three";

// mixes sound and music volumes
export default class MainMixer {
  context: AudioContext;
  master: AudioNode;
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
    this.music.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }
}
