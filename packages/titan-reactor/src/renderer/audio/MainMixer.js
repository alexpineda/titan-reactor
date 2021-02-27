import { AudioContext } from "three";

export default class MainMixer {
  constructor() {
    this.context = AudioContext.getContext();

    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);

    this.sound = this.context.createGain();
    this.sound.connect(this.gain);

    this.music = this.context.createGain();
    this.music.connect(this.gain);

    this.input = this.context.createDynamicsCompressor();
    this.input.connect(this.gain);
  }

  // compatibility with THREE.Audio until we change BgMusic
  getInput() {
    return this.music;
  }

  get soundVolume() {
    return this.sound.gain.volume;
  }

  set soundVolume(val) {
    this.sound.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get musicVolume() {
    return this.music.gain.volume;
  }

  set musicVolume(val) {
    this.music.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get volume() {
    return this.gain.gain.volume;
  }

  set volume(val) {
    this.gain.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  play(buffer) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.input);
    source.start(0);
  }
}
