import { is } from "ramda";

// rolling number "rolls" the number from source to target, used for resources and apm
export default class RollingNumber {
  constructor(value = 0) {
    this.upSpeed = 80;
    this.downSpeed = 30;
    this._value = value;
    this._rollingValue = value;
  }

  update(delta) {
    if (this._running && delta >= this._speed) {
      this._rollingValue = this._direction
        ? Math.min(this._value, this._rollingValue + 1)
        : Math.max(this._value, this._rollingValue - 1);

      if (this._rollingValue === this._value) {
        this._running = false;
      }
      return true;
    }
    return false;
  }

  get rollingValue() {
    return this._rollingValue;
  }

  get isRunning() {
    return this._running;
  }

  start(val) {
    if (val === this._value || !is(Number, val)) return;
    this._value = val;

    const direction = val > this._rollingValue;

    if (this._running && direction === this._direction) {
      return;
    }

    this._direction = direction;
    this._speed = direction ? this.upSpeed : this.downSpeed;
    this._running = true;
  }

  stop() {
    this._running = false;
  }
}
