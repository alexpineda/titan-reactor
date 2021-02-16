import { AudioLoader, PositionalAudio } from "three";
import { DebugLog } from "../utils/DebugLog";
import { range } from "ramda";

export default class Audio {
  constructor(bwDat, audioListener, addSound) {
    this.bwDat = bwDat;
    this.logger = new DebugLog("audio");
    this.audioListener = audioListener;
    this.audioPool = {};

    this.volume = 1;
    this.maxSounds = 10;
    this.sounds = range(0, this.maxSounds).map(
      () => new PositionalAudio(this.audioListener)
    );
    this.sounds.forEach((s) => addSound(s));
  }

  setVolume(volume) {
    this.volume = volume;
  }

  _getFree(soundId, elapsed) {
    if (
      this.audioPool[soundId] &&
      elapsed - this.audioPool[soundId].elapsed < 80
    ) {
      return;
    }

    return this.sounds.find((sound) => !sound.isPlaying);
  }

  play(soundId, x, y, z, elapsed) {
    const sound = this._getFree(soundId, elapsed);
    if (!sound) return;

    sound.position.set(x, y, z);

    if (this.audioPool[soundId]) {
      this.audioPool[soundId].elapsed = elapsed;
      sound.setBuffer(this.audioPool[soundId].buffer);
      sound.setVolume(this.volume);
      sound.play();
      return;
    }

    const audioLoader = new AudioLoader();
    audioLoader.load(`sound/${this.bwDat.sounds[soundId].file}`, (buffer) => {
      this.audioPool[soundId] = {
        buffer,
        elapsed,
      };

      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.setRolloffFactor(2.2);
      sound.setDistanceModel("exponential");
      sound.setVolume(this.volume);
      sound.play();
    });
  }

  // unit.userData.runner.on("playsnd", playSound);
  // unit.userData.runner.on("playsndbtwn", playSound);
  // unit.userData.runner.on("playsndrand", playSound);
  // unit.userData.runner.on("attackmelee", playSound);
}
