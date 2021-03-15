import { Audio, AudioLoader } from "three";
const rand = (n) => Math.floor(Math.random() * n);

class Music {
  constructor(races) {
    this.races = races;
  }

  setListener(listener) {
    this.audio = new Audio(listener);
  }

  getAudio() {
    return this.audio;
  }

  playGame() {
    this.audio.onEnded = this.playGame.bind(this);
    this._play(`music/${this.races[rand(2)]}${rand(4) + 1}.ogg`);
  }

  playMenu() {
    const race = ["t", "z", "p"];
    this.audio.onEnded = this.playMenu.bind(this);
    this._play(race[rand(2)] + "rdyroom.ogg");
  }

  _play(filepath) {
    console.log(`now playing ${filepath}`);
    const audioLoader = new AudioLoader();

    const { audio } = this;
    if (audio.isPlaying) {
      audio.stop();
    }

    audioLoader.load(filepath, function (buffer) {
      audio.setBuffer(buffer);
      audio.play();
    });
  }

  stop() {
    this.audio.stop();
  }

  dispose() {
    if (this.audio && this.audio.isPlaying) {
      this.audio.stop();
      this.audio = null;
    }
  }
}

export default Music;
