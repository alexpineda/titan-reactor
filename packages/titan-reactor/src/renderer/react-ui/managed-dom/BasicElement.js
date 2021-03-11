export default class BasicElement {
  constructor() {
    this.domElement = document.createElement("span");
    this.textNode = document.createTextNode("");
    this.domElement.appendChild(this.textNode);
    this.value = "";
  }

  set value(val) {
    this._value = val;
    this.textNode.nodeValue = val;
  }

  get value() {
    return this._value;
  }
}
