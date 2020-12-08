import { AudioLoader, DefaultLoadingManager, PositionalAudio } from "three";
import { DebugLog } from "../utils/DebugLog";

export class Audio {
  constructor(
    bwDataPath,
    bwDat,
    audioListener,
    loadingManager = DefaultLoadingManager
  ) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.logger = new DebugLog("audio");
    this.audioListener = audioListener;
    this.audioPool = {};
    this.loadingManager = loadingManager;
    this.volume = 1;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  initUnit(unit) {
    this.logger.assign(unit.userData);
    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        this.logger.log(
          `%c 🔊 ${soundId}`,
          "background: #ffff00; color: #000000"
        );
        return;
      } else {
        this.logger.log(
          `%c 🔇 ${soundId}`,
          "background: #990000; color: #ffffff"
        );
      }

      this.logger.log(`play sound ${soundId}`);
      if (this.audioPool[soundId]) {
        unitSound.setBuffer(this.audioPool[soundId]);
        unitSound.setVolume(this.volume);
        unitSound.play();
        return;
      }

      const audioLoader = new AudioLoader(this.loadingManager);
      audioLoader.load(
        `${this.bwDataPath}/sound/${this.bwDat.sounds[soundId].file}`,
        (buffer) => {
          this.audioPool[soundId] = buffer;
          unitSound.setBuffer(buffer);
          unitSound.setRefDistance(10);
          unitSound.setRolloffFactor(2.2);
          unitSound.setDistanceModel("exponential");
          unitSound.setVolume(1);
          unitSound.play();
        }
      );
    };
    unit.userData.runner.on("playsnd", playSound);
    unit.userData.runner.on("playsndbtwn", playSound);
    unit.userData.runner.on("playsndrand", playSound);
    unit.userData.runner.on("attackmelee", playSound);
  }
}
