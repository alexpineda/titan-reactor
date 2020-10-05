import { easeCubicOut } from "d3-ease";
import { orders } from "../../common/bwdat/orders";
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
    this.autoSpeed = false;
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
    if (this.bwGameFrame === this.maxFrame) return;
    this.paused = false;
    this.lastDelta = 0;
    this.clock.start();
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

    return `${minutes}:${("00" + seconds).slice(-2)}`;
  }

  skippingFrames() {
    return this.skipGameFrames > 1;
  }

  setAutoSpeed(val) {
    this.autoSpeed = val;
    this.gameSpeed = gameSpeeds.fastest;
    this.skipGameFrames = 0;
    this.lastDelta = 0;
  }

  readUInt32AndAdvance() {
    const v = this.buf.getUint32(this.bwapiBufferPosition, true);
    this.advanceBuffer(4);
    return v;
  }

  readInt32AndAdvance() {
    const v = this.buf.getInt32(this.bwapiBufferPosition, true);
    this.advanceBuffer(4);
    return v;
  }

  advanceBuffer(bytes) {
    this.bwapiBufferPosition += bytes;
  }

  updateAutoSpeed(attackingUnits) {
    if (
      this.autoSpeed &&
      !this.skippingFrames() &&
      this.frame % (24 * 10) === 0
    ) {
      const orderScoreNorm = (order) => this._orderScore(order) / 5;

      const n = attackingUnits.reduce(
        (sum, unit) => sum + orderScoreNorm(unit.userData.current.order),
        0
      );

      const t = 1 - easeCubicOut(n / (attackingUnits.length + 1));
      this.gameSpeed =
        t * (gameSpeeds["1.5x"] - gameSpeeds.fastest) + gameSpeeds.fastest;
      console.log("auto", this.gameSpeed);
    }
  }

  _orderScore(order) {
    switch (order) {
      case orders.castScannerSweep:
        return 2;
      case orders.interceptorAttack:
        return 3;
      case orders.holdPosition:
      case orders.stop:
      case orders.move:
      case orders.burrowing:
      case orders.unburrowing:
      case orders.medicHeal:
      case orders.attackMove:
        return 5;
      case orders.castConsume:
      case orders.castDarkSwarm:
      case orders.castDefensiveMatrix:
      case orders.castDisruptionWeb:
      case orders.castEmpShockwave:
      case orders.castEnsnare:
      case orders.castFeedback:
      case orders.castHallucination:
      case orders.castInfestation:
      case orders.castIrradiate:
      case orders.castLockdown:
      case orders.castMaelstrom:
      case orders.castMindControl:
      case orders.castNuclearStrike:
      case orders.castOpticalFlare:
      case orders.castParasite:
      case orders.castPlague:
      case orders.castPsionicStorm:
      case orders.castRecall:
      case orders.castRestoration:
      case orders.castScannerSweep:
      case orders.castSpawnBroodlings:
      case orders.castStasisField:
      case orders.scarabAttack:
        return 6;
      default:
        return 0;
    }
  }
}
