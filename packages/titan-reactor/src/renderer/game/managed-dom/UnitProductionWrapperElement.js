import { range } from "ramda";
import UnitProductionElement from "./UnitProductionElement";

export default class UnitProductionWrapperElement {
  constructor(cmdIcons, color) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex");
    this.units = range(0, 10).map(
      () => new UnitProductionElement(cmdIcons, color)
    );
    for (const unit of this.units) {
      this.domElement.append(unit.domElement);
    }
  }
}
