import UnitWireframe from "./UnitWireframe";

export default class SmallUnitDetailElement {
  constructor(wireframeIcons) {
    this.wireframe = new UnitWireframe(wireframeIcons, "md");
    this.domElement = this.wireframe.domElement;
    this.domElement.style.display = "none";
  }

  set value(val) {
    this._value = val;
    if (val && val.canSelect) {
      this.wireframe.update(val);
      this.wireframe.domElement.style.display = "block";
    } else {
      this.wireframe.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
