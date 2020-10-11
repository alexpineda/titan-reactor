import { Audio, AudioLoader } from "three";
const rand = (n) => Math.floor(Math.random() * n);

export class BgMusic {
  constructor(listener) {
    this.audio = new Audio(listener);
  }

  getAudio() {
    return this.audio;
  }

  playGame() {
    const race = ["terran", "zerg", "protoss"];
    this.audio.onEnded = this.playGame.bind(this);
    this._play(`music/${race[rand(2)]}${rand(4) + 1}.ogg`);
  }

  playMenu() {
    const race = ["t", "z", "p"];
    this.audio.onEnded = this.playMenu.bind(this);
    this._play(race[rand(2)] + "rdyroom.ogg");
  }

  _play(filepath) {
    console.log(`now playing ${filepath}`);
    const audioLoader = new AudioLoader();

    const { audio, volume } = this;
    if (audio.isPlaying) {
      audio.stop();
    }
    audioLoader.load(filepath, function (buffer) {
      audio.setBuffer(buffer);
      audio.setVolume(volume);
      audio.play();
    });
  }

  stop() {
    this.audio.stop();
  }

  setVolume(volume) {
    this.volume = volume;
    this.audio.setVolume(volume);
    // this.audio.setVolume(Math.min(1, Math.max(0, volume)));
  }

  dispose() {
    this.audio.stop();
    this.audio = null;
  }
}
