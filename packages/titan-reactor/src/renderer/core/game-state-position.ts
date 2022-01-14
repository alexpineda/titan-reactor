import { gameSpeeds } from "../../common/utils/conversions";

export enum GameStatePlayMode {
  Continuous = 0,
  SingleStep = 1,
}

export class GameStatePosition {
  lastDelta = 0;
  maxFrame: number;
  tick = 0;
  bwGameFrame = 0;
  advanceGameFrames = 0;
  paused = true;
  destination?: number;
  gameSpeed: number;
  maxSkipFrames: number;
  mode = GameStatePlayMode.SingleStep;

  constructor(maxFrame: number, gameSpeed: number, maxSkipFrames = 1) {
    this.maxFrame = maxFrame;
    this.gameSpeed = gameSpeed;
    this.maxSkipFrames = maxSkipFrames;
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.advanceGameFrames = 0;
  }

  resume() {
    if (!this.paused) return;
    if (this.bwGameFrame === this.maxFrame) return;
    this.paused = false;
    this.lastDelta = 0;
  }

  togglePlay() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  update(delta: number) {
    this.tick++;
    if (this.paused) return;

    this.lastDelta = this.lastDelta + delta;
    if (this.lastDelta >= this.gameSpeed) {
      this.advanceGameFrames = Math.floor(this.lastDelta / this.gameSpeed);
      this.lastDelta = this.lastDelta - this.advanceGameFrames * this.gameSpeed;
      this.advanceGameFrames = 1;
    } else {
      this.advanceGameFrames = 0;
    }
  }

  isMaxFrame() {
    return this.bwGameFrame === this.maxFrame;
  }

  getFriendlyTime() {
    const t = Math.floor((this.bwGameFrame * gameSpeeds.fastest) / 1000);
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);

    return `${minutes}:${("00" + seconds).slice(-2)}`;
  }

  skippingFrames() {
    return this.advanceGameFrames > 1;
  }
}
