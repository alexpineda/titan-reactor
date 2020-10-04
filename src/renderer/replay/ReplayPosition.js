import { gameSpeeds } from "../utils/conversions";

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
  constructor(buf, maxFrame, clock, gameSpeed) {
    this.buf = buf;
    this.maxFrame = maxFrame;
    this.frame = 0;
    this.bwapiBufferPosition = 0;
    this.bwGameFrame = 0;
    this.skipGameFrames = 0;
    this.skipPhysicsFrames = 20;
    this._maxSkipSpeed = 100;
    this.gameSpeed = gameSpeed;
    this.clock = clock;
    this.lastDelta = 0;
    this.paused = true;
    this.onResetState = () => {};
  }

  goto(frame) {
    this.destination = Math.min(frame, this.maxFrame);
    this.lastDelta = 0;
    this.skipGameFrames = 0;
    this._goto = () => {
      if (frame > this.bwGameFrame) {
        this.skipGameFrames = Math.min(
          frame - this.bwGameFrame,
          this._maxSkipSpeed
        );
      } else {
        this.skipGameFrames = Math.min(frame, this._maxSkipSpeed);
        this.bwapiBufferPosition = 0;
        this.bwGameFrame = 0;
        this.onResetState();
      }
      this._goto = null;
    };
  }

  pause() {
    this.paused = true;
    this.skipGameFrames = 0;
    this.clock.stop();
  }

  resume() {
    this.paused = false;
    this.lastDelta = 0;
  }

  update() {
    this.frame++;
    if (this.paused) return;

    this._goto && this._goto();

    if (this.destination) {
      if (this.bwGameFrame === this.destination) {
        delete this.destination;
        this.skipGameFrames = 0;
        this.lastDelta = 0;
      }
      if (
        this.bwGameFrame >= this.destination - this._maxSkipSpeed &&
        this.bwGameFrame <= this.destination + this._maxSkipSpeed
      ) {
        this.skipGameFrames = this.destination - this.bwGameFrame;
      }
    } else {
      this.lastDelta = this.lastDelta + this.clock.getDelta();
      if (this.lastDelta >= this.gameSpeed) {
        this.skipGameFrames = Math.floor(this.lastDelta / this.gameSpeed);
        if (this.skipGameFrames > this._maxSkipSpeed) {
          this.goto(this.bwGameFrame + this.skipGameFrames);
        } else {
          this.lastDelta =
            this.lastDelta - this.skipGameFrames * this.gameSpeed;
        }
      } else {
        this.skipGameFrames = 0;
      }
    }
  }

  isMaxFrame() {
    return this.bwGameFrame === this.maxFrame;
  }

  getFriendlyTime() {
    const t = (this.bwGameFrame * gameSpeeds.fastest) / 1000;
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    return `${minutes}:${seconds.toFixed(2)}`;
  }

  skippingFrames() {
    return this.skipGameFrames > 1;
  }

  readUInt32AndAdvance() {
    const v = this.buf.getUint32(this.bwapiBufferPosition, true);
    this.advanceBuffer(4);
    return v;
  }

  advanceBuffer(bytes) {
    this.bwapiBufferPosition += bytes;
  }
}
