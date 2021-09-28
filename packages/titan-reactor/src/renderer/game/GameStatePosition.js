import { MathUtils } from "three";
import { framesBySeconds, gameSpeeds } from "../../common/utils/conversions";
import ClockMs from "../../common/utils/ClockMs";

/**
 * Allows for play/pause of the game and tracks game frame position
 */
export class GameStatePosition {
  constructor(maxFrame, gameSpeed, heatMapScore) {
    /**
     * The difference between last update call in ms
     */
    this.lastDelta = 0;

    /**
     * Maximum number of frames this replay
     */
    this.maxFrame = maxFrame;

    /**
     * ticks every update()
     */
    this.frame = 0;

    /**
     * ticks every game tick
     */
    this.bwGameFrame = 0;

    /**
     * Number of frames to skip (in case of cpu hiccup or seeking)
     */
    this.skipGameFrames = 0;

    /**
     * The current ms per bw frame, may be a standard value like fastest or set by autospeed
     */
    this.gameSpeed = gameSpeed;
    this.autoSpeed = 0;
    this.autoSpeedLerpClock = new ClockMs();
    this.maxAutoSpeed = 1.2;

    this.paused = true;
    this.destination = undefined;
    this.heatMapScore = heatMapScore;
    this.autoSpeedRefreshRate = framesBySeconds(5);
    this.onResetState = () => {};
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

  /**
   * Updates skipGameFrames according to how many frames we want to progress
   */
  update(delta) {
    this.frame++;
    if (this.paused) return;

    this.lastDelta = this.lastDelta + delta;
    if (this.lastDelta >= this.gameSpeed) {
      // this.skipGameFrames = 1;
      this.skipGameFrames = Math.floor(this.lastDelta / this.gameSpeed);
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

  /**
   * Sets the autospeed value
   * @param {Number} val
   */
  setAutoSpeed(val) {
    this.autoSpeed = val;
    this.autoSpeedLerpClock.elapsedTime = 0;
    if (val) {
      this.autoSpeedLerpClock.start();
    } else {
      this.autoSpeedLerpClock.stop();
    }
    this.gameSpeed = gameSpeeds.fastest;
    this.skipGameFrames = 0;
    this.lastDelta = 0;
  }

  /**
   * To conserve cpu cycles we only update X frames
   */
  willUpdateAutospeed() {
    if (!this.autoSpeed) {
      return false;
    }
    return this.frame % this.autoSpeedRefreshRate === 0;
  }

  /**
   * @param {Number} val
   */
  setMaxAutoSpeed(val) {
    if (val > 1) {
      this.autoSpeed = gameSpeeds.fastest;
      this.maxAutoSpeed = (val - 1) * (gameSpeeds.fastest / 2);
    } else {
      this.autoSpeed = 0;
    }
  }

  /**
   * @param {Array} attackingUnits
   */
  updateAutoSpeed(attackingUnits, delta) {
    if (!this.autoSpeed) {
      return;
    }

    this.gameSpeed = MathUtils.damp(
      this.gameSpeed,
      this.autoSpeed,
      0.01,
      delta
    );
    // this.gameSpeed = MathUtils.lerp(
    //   this.gameSpeed,
    //   this.autoSpeed,
    //   this.autoSpeedLerpClock.getElapsedTime() / 5000
    // );

    if (this.frame % this.autoSpeedRefreshRate === 0) {
      this.autoSpeed =
        gameSpeeds.fastest -
        (1 - this.heatMapScore.totalScore(attackingUnits)) * this.maxAutoSpeed +
        +Math.random() * 0.001; // variance for useEffect in UI
      this.autoSpeedLerpClock.elapsedTime = 0;
      return true;
    }
    return false;
  }
}
