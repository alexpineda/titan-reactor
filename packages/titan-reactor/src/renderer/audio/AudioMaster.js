import Music from "./Music";
import MainMixer from "./MainMixer";
import SoundChannels from "./SoundChannels";

// central point for sound mixer, and audio channels for game sounds
export default class AudioMaster {
  constructor(loadSoundAsync, panningStyle, races) {
    this.mixer = new MainMixer();
    this.channels = new SoundChannels(this.mixer, loadSoundAsync, panningStyle);
    this.music = new Music(races);
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
    this.mixer.musicVolume = val;
  }

  update(x, y, z, delta) {
    const endTime = this.mixer.context.currentTime + delta * 0.001;
    this.mixer.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.mixer.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.mixer.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }

  dispose() {
    this.music.dispose();
  }
}
