import { MathUtils } from "three";
import {
  framesBySeconds,
  gameSpeeds,
} from "titan-reactor-shared/utils/conversions";

export class ClockMs {
  constructor(autoStart) {
    this.autoStart = autoStart !== undefined ? autoStart : true;

    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;

    this.running = false;
  }

  start() {
    this.startTime = (typeof performance === "undefined"
      ? Date
      : performance
    ).now(); // see #10732

    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;

    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }

    if (this.running) {
      const newTime = (typeof performance === "undefined"
        ? Date
        : performance
      ).now();

      diff = newTime - this.oldTime;
      this.oldTime = newTime;

      this.elapsedTime += diff;
    }

    return diff;
  }
}

export class ReplayPosition {
  constructor(maxFrame, clock, gameSpeed, heatMapScore) {
    this.maxFrame = maxFrame;
    this.frame = 0;
    this.bwGameFrame = 0;
    this.skipGameFrames = 0;
    this.skipPhysicsFrames = 20;
    this._maxSkipSpeed = 100;
    this.gameSpeed = gameSpeed;
    this.autoSpeed = 0;
    this.autoSpeedLerpClock = new ClockMs();
    this.maxAutoSpeed = 1.5;
    this.clock = clock;
    this.lastDelta = 0;
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
    this.clock.stop();
  }

  resume() {
    if (!this.paused) return;
    if (this.bwGameFrame === this.maxFrame) return;
    this.paused = false;
    this.lastDelta = 0;
    this.clock.start();
  }

  togglePlay() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  update() {
    this.frame++;
    if (this.paused) return;

    this.lastDelta = this.lastDelta + this.clock.getDelta();
    if (this.lastDelta >= this.gameSpeed) {
      this.skipGameFrames = 1;
      // this.skipGameFrames = Math.floor(this.lastDelta / this.gameSpeed);
      this.lastDelta = 0;
      // this.lastDelta = this.lastDelta - this.skipGameFrames * this.gameSpeed;
    } else {
      this.skipGameFrames = 0;
    }
  }

  isMaxFrame() {
    return this.bwGameFrame === this.maxFrame;
  }

  getFriendlyTime() {
    const t = (this.bwGameFrame * gameSpeeds.fastest) / 1000;
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);

    return `${minutes}:${("00" + seconds).slice(-2)}`;
  }

  skippingFrames() {
    return this.skipGameFrames > 1;
  }

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

  willUpdateAutospeed() {
    if (!this.autoSpeed || this.destination) {
      return false;
    }
    return this.frame % this.autoSpeedRefreshRate === 0;
  }

  setMaxAutoSpeed(val) {
    if (val > 1) {
      this.autoSpeed = gameSpeeds.fastest;
      this.maxAutoSpeed = (val - 1) * (gameSpeeds.fastest / 2);
    } else {
      this.autoSpeed = 0;
    }
  }

  updateAutoSpeed(attackingUnits) {
    if (!this.autoSpeed || this.destination) {
      return;
    }

    this.gameSpeed = MathUtils.lerp(
      this.gameSpeed,
      this.autoSpeed,
      this.autoSpeedLerpClock.getElapsedTime() / 5000
    );

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
