import UnitWireframe from "./UnitWireframe";
import useGameStore from "../../stores/gameStore";
import { unstable_batchedUpdates } from "react-dom";

export default class SmallUnitDetailElement {
  constructor(wireframeIcons) {
    this.wireframe = new UnitWireframe(wireframeIcons, "md");
    this.domElement = this.wireframe.domElement;
    this.domElement.style.display = "none";
    this.domElement.style.cursor = "pointer";
    this.domElement.onclick = (evt) => {
      if (this._value && !this._value.canSelect) return;
      unstable_batchedUpdates(() => {
        if (evt.ctrlKey) {
          useGameStore.getState().selectOfType(this._value.unitType);
        } else {
          useGameStore.getState().setSelectedUnits([this._value]);
        }
      });
    };
  }

  set value(val) {
    if (val && val.canSelect) {
      this._value = val;
      this.wireframe.update(val);
      this.wireframe.domElement.style.display = "block";
    } else {
      this._value = null;
      this.wireframe.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
