import MainMixer from "./main-mixer";
import Music from "./music";
import SoundChannels from "./sound-channels";
import { AudioListener } from "three";
import { BwDAT } from "../../common/types";

// central point for sound mixer, and audio channels for game sounds
export class AudioMaster {
  mixer = new MainMixer();
  queued = [];
  channels: SoundChannels;
  music: Music;

  constructor(
    bwDat: BwDAT,
    loadSoundAsync: (id: number) => Promise<ArrayBuffer>,
    races: string[]
  ) {
    this.channels = new SoundChannels(bwDat, this.mixer, loadSoundAsync);
    this.music = new Music(races);
    this.music.setListener(this.mixer as unknown as AudioListener);
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
