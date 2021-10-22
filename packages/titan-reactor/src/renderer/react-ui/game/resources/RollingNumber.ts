// rolling number "rolls" the number from source to target, used for resources and apm
export default class RollingNumber {
  upSpeed = 80;
  downSpeed = 30;

  private _value: number;
  private _rollingValue: number;
  private _running = false;
  private _speed = 0;
  private _direction = false;

  constructor(value = 0) {
    this._value = value;
    this._rollingValue = value;
  }

  update(delta: number) {
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

  start(val: number) {
    if (val === this._value) return;
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
