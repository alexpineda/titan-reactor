import { AudioContext, Vector3 } from "three";
import fs from "fs/promises";

const MUSIC_REDUCTION_RATIO = 0.1;
const _position = new Vector3;
// mixes sound and music volumes
export class MainMixer {
  sound: GainNode;
  music: GainNode;
  gain: GainNode;
  context: AudioContext;
  compressor: DynamicsCompressorNode;


  constructor() {
    this.context = AudioContext.getContext();

    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);

    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.connect(this.gain);

    this.sound = this.context.createGain();
    this.sound.connect(this.compressor);

    this.music = this.context.createGain();
    this.music.connect(this.gain);

  }

  // For compatibility with THREE.Audio, which is used for Music.
  // getInput() is called on the THREE.Audio constructor.
  // If in the future, we want audio for our menu, we'll need to dynamically swap this.
  getInput() {
    return this.music;
  }

  get masterVolume() {
    return this.gain.gain.value;
  }

  set masterVolume(val) {
    this.gain.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get soundVolume() {
    return this.sound.gain.value;
  }

  set soundVolume(val) {
    if (val === this.sound.gain.value) return;
    this.sound.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get musicVolume() {
    return this.music.gain.value;
  }

  set musicVolume(val) {
    if (val === this.music.gain.value) return;
    this.music.gain.setTargetAtTime(val * MUSIC_REDUCTION_RATIO, this.context.currentTime, 0.01);
  }

  update(x: number, y: number, z: number, delta: number) {
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
      return;
    }
    const endTime = this.context.currentTime + delta * 0.001;
    this.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }

  updateFromVector3(v: Vector3, delta: number) {
    this.update(v.x, v.y, v.z, delta);
  }

  get position() {
    _position.set(this.context.listener.positionX.value, this.context.listener.positionY.value, this.context.listener.positionZ.value);
    return _position;
  }

  noise(length = 3, loop = true) {
    const source = this.context.createBufferSource();
    // fill the buffer with white noise (random values between -1.0 and 1.0)
    const arrayBuffer = this.context.createBuffer(
      2,
      this.context.sampleRate * length,
      this.context.sampleRate
    );
    for (let channel = 0; channel < arrayBuffer.numberOfChannels; channel++) {
      let nowBuffering = arrayBuffer.getChannelData(channel);
      for (let i = 0; i < arrayBuffer.length; i++) {
        nowBuffering[i] = Math.random() * 2 - 1;
      }
    }
    source.buffer = arrayBuffer;
    source.loop = loop;

    const gain = this.context.createGain();
    source.connect(gain);
    return { source, gain };
  }


  async loadAudioFile(filename: string) {
    const buffer = (
      await fs.readFile(filename)
    ).buffer;

    const result = await this.context.decodeAudioData(buffer.slice(0));
    const sound = this.context.createBufferSource();
    sound.buffer = result;
    return sound;
  }
}

export const mixer = new MainMixer();
