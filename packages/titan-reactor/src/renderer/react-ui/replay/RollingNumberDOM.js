import { is } from "ramda";

export default class RollingNumberDOM {
  constructor(upSpeed = 30, downSpeed = 10, domElement) {
    this.domElement = domElement || document.createElement("span");
    this.upSpeed = upSpeed;
    this.downSpeed = downSpeed;
    this.value = 0;
    this._displayValue = 0;
  }

  _setValue(number) {
    this._displayValue = number;
    this.domElement.innerText = number;
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
}
