import { AudioContext, Vector3 } from "three";
import fs from "fs/promises";
import {
  readCascFile,
} from "@utils/casclib";
import gameStore from "@stores/game-store";
import { Settings } from "common/types";
const MUSIC_REDUCTION_RATIO = 0.1;
const _position = new Vector3;
// mixes sound and music volumes
export class MainMixer {
  intro: GainNode;
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

    this.intro = this.context.createGain();
    this.intro.connect(this.compressor);

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

  setVolumes(volumes: Settings["audio"]) {
    this.masterVolume = volumes.global;
    this.soundVolume = volumes.sound;
    this.musicVolume = volumes.music;
    this.intro.gain.value = volumes.playIntroSounds ? 1 : 0;
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

  async loadAudioBuffer(id: number): Promise<AudioBuffer>
  async loadAudioBuffer(filename: string): Promise<AudioBuffer>
  async loadAudioBuffer(filenameOrId: string | number): Promise<AudioBuffer> {
    if (typeof filenameOrId === "number") {
      const assets = gameStore().assets!;
      const buffer = (await readCascFile(`sound/${assets.bwDat.sounds[filenameOrId].file}`)).buffer
      return await this.context.decodeAudioData(buffer.slice(0));
    }
    else if (typeof filenameOrId === "string" && filenameOrId.startsWith("casc:")) {
      const filename = filenameOrId.replace("casc:", "");
      const buffer = (await readCascFile(filename)).buffer
      return await this.context.decodeAudioData(buffer.slice(0));
    } else {
      const buffer = (
        await fs.readFile(filenameOrId)
      ).buffer;
      return (await this.context.decodeAudioData(buffer.slice(0)));
    }
  }

  connect(...args: AudioNode[]) {
    for (let i = 0; i < args.length - 1; i++) {
      args[i].connect(args[i + 1])
    }
    return () => {
      for (let i = 0; i < args.length - 1; i++) {
        args[i].disconnect(args[i + 1])
      }
    }
  }

  createGain(value: number) {
    const gain = this.context.createGain();
    gain.gain.value = value;
    return gain;
  }

  createDistortion(k = 50) {
    const DEG = Math.PI / 180;

    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    curve.forEach((_, i) => {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * DEG) / (Math.PI + k * Math.abs(x));
    });
    return new WaveShaperNode(this.context, { curve });
  }

  smoothStop(gain: GainNode, delta = 0, decay = 1) {
    // // https://alemangui.github.io/ramp-to-value

    gain.gain.setValueAtTime(
      gain.gain.value,
      this.context.currentTime + delta
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.context.currentTime + delta + decay * 0.001
    );
  }
}

export const mixer = new MainMixer();
