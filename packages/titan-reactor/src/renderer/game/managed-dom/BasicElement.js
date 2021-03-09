export default class BasicElement {
  constructor() {
    this.domElement = document.createElement("span");
    this.value = "";
  }

  set value(val) {
    this._value = val;
    this.domElement.innerText = val;
  }

  get value() {
    return this._value;
  }
}
