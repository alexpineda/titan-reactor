import { AudioContext } from "three";

export default class MainMixer {
  constructor() {
    this.context = AudioContext.getContext();

    this.master = this.context.createGain();
    this.master.connect(this.context.destination);

    // this.compressor = this.context.createDynamicsCompressor();
    // this.compressor.connect(this.master);

    this.sound = this.context.createGain();
    this.sound.connect(this.master);

    this.music = this.context.createGain();
    this.music.connect(this.master);
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

  get volume() {
    return this.master.gain.volume;
  }

  set volume(val) {
    this.master.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }
}
