import { gameSpeeds } from "../../common/utils/conversions";

export class GameStatePosition {
  lastDelta = 0;
  maxFrame: number;
  frame = 0;
  bwGameFrame = 0;
  skipGameFrames = 0;
  paused = true;
  destination?: number;
  gameSpeed: number;
  maxSkipFrames: number;

  constructor(maxFrame: number, gameSpeed: number, maxSkipFrames = 1) {
    this.maxFrame = maxFrame;
    this.gameSpeed = gameSpeed;
    this.maxSkipFrames = maxSkipFrames;
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.skipGameFrames = 0;
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
    this.frame++;
    if (this.paused) return;

    this.lastDelta = this.lastDelta + delta;
    if (this.lastDelta >= this.gameSpeed) {
      // this.skipGameFrames = 1;
      this.skipGameFrames = Math.min(
        this.maxSkipFrames,
        Math.floor(this.lastDelta / this.gameSpeed)
      );
      this.lastDelta = this.lastDelta - this.skipGameFrames * this.gameSpeed;
    } else {
      this.skipGameFrames = 0;
    }
  }

  isMaxFrame() {
    return this.bwGameFrame === this.maxFrame;
  }

  /**
   * Time in fastest seconds
   */
  getFriendlyTime() {
    const t = Math.floor((this.bwGameFrame * gameSpeeds.fastest) / 1000);
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);

    return `${minutes}:${("00" + seconds).slice(-2)}`;
  }

  skippingFrames() {
    return this.skipGameFrames > 1;
  }
}
