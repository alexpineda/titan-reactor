export default class SmallUnitDetailElement {
  constructor() {
    this.domElement = document.createElement("span");
    this.textNode = document.createTextNode("");
    this.domElement.appendChild(this.textNode);
    this.domElement.style.display = "none";
    this.value = "";
  }

  set value(val) {
    this._value = val;
    if (val) {
      this.textNode.nodeValue = val.id;
      this.domElement.style.display = "block";
    } else {
      this.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
