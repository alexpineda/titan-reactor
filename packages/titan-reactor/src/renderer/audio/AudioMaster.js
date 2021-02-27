import Music from "./BgMusic";
import MainMixer from "./MainMixer";
import SoundChannels from "./SoundChannels";

export default class AudioMaster {
  constructor(loadSoundAsync) {
    this.offlineMixer;
    this.mixer = new MainMixer();
    this.channels = new SoundChannels(this.mixer, loadSoundAsync);
    this.music = new Music();
    this.music.setListener(this.mixer);
    this.queued = [];
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
    this.music.setVolume(val);
  }

  update(x, y, z, delta) {
    const endTime = this.mixer.context.currentTime + delta;
    this.mixer.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.mixer.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.mixer.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }
}
