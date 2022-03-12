import { Audio, AudioListener, AudioLoader } from "three";
import * as log from "../ipc/log"

const rand = (n: number) => Math.floor(Math.random() * n);

export class Music {
  audio?: Audio;
  races: string[];
  constructor(races: string[]) {
    this.races = races;
  }

  setListener(listener: AudioListener) {
    this.audio = new Audio(listener);
  }

  getAudio() {
    return this.audio;
  }

  playGame() {
    if (!this.audio) return;
    this.audio.onEnded = this.playGame.bind(this);
    this._play(
      `music/${this.races[rand(this.races.length)]}${rand(4) + 1}.ogg`
    );
  }

  playMenu() {
    if (!this.audio) return;
    const race = ["t", "z", "p"];
    this.audio.onEnded = this.playMenu.bind(this);
    this._play(race[rand(2)] + "rdyroom.ogg");
  }

  _play(filepath: string) {
    if (!this.audio) return;
    log.verbose(`now playing ${filepath}`);
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
    if (!this.audio) return;
    this.audio.stop();
  }

  dispose() {
    if (this.audio && this.audio.isPlaying) {
      this.audio.stop();
      delete this.audio;
    }
  }
}
export default Music;
