import { is } from "ramda";

// rolling number "rolls" the number from source to target, used for resources and apm
export default class RollingNumber {
  constructor(value = 0, textRef) {
    this.upSpeed = 30;
    this.downSpeed = 10;
    this.value = value;
    this._displayValue = value;
    this.textRef = textRef;
  }

  _setValue(number) {
    this._displayValue = number;
    if (this.textRef.current) {
      this.textRef.current.textContent = number;
    }
  }

  get value() {
    return this._value;
  }

  set value(val) {
    if (val === this._value || !is(Number, val)) return;
    this._value = val;

    const direction = val > this._displayValue;

    if (this._interval && direction === this._lastDirection) {
      return;
    }
    this.start(direction);
  }

  start(direction) {
    this._lastDirection = direction;
    const speed = direction ? this.upSpeed : this.downSpeed;

    if (this._interval) {
      clearInterval(this._interval);
    }

    this._interval = setInterval(() => {
      let val;

      if (direction) {
        val = Math.min(this.value, this._displayValue + 1);
        this._setValue(val);
      } else {
        val = Math.max(this.value, this._displayValue - 1);
        this._setValue(val);
      }

      if (val === this.value) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }, speed);
  }

  dispose() {
    clearInterval(this._interval);
  }
}
