import MainMixer from "./main-mixer";
import Music from "./music";
import SoundChannels from "./sound-channels";
import {AudioListener} from "three";

// central point for sound mixer, and audio channels for game sounds
export class AudioMaster {
  mixer = new MainMixer();
  queued = [];
  channels: SoundChannels;
  music: Music;

  constructor(
    loadSoundAsync: (id: number) => Promise<ArrayBuffer>,
    races: string[]
  ) {
    this.channels = new SoundChannels(this.mixer, loadSoundAsync);
    this.music = new Music(races);
    this.music.setListener(this.mixer as unknown as AudioListener);
  }

  get soundVolume() {
    return this.mixer.soundVolume;
  }

  set soundVolume(val) {
    this.mixer.soundVolume = val;
  }

  get musicVolume() {
    return this.mixer.musicVolume;
  }

  set musicVolume(val) {
    this.mixer.musicVolume = val;
  }

  update(x: number, y: number, z: number, delta: number) {
    const endTime = this.mixer.context.currentTime + delta * 0.001;
    this.mixer.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.mixer.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.mixer.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }

  dispose() {
    this.music.dispose();
  }
}
export default AudioMaster;
