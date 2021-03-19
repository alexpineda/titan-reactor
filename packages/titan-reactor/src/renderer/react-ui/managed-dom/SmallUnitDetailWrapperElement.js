import { range } from "ramda";
import SmallUnitDetailElement from "./SmallUnitDetailElement";

export default class SmallUnitDetailWrapperElement {
  constructor(wireframeIcons) {
    this.domElement = document.createElement("div");
    // this.domElement.classList.add("flex", "ml-6");
    this.items = range(0, 12).map(
      () => new SmallUnitDetailElement(wireframeIcons)
    );

    for (const unit of this.items) {
      this.domElement.append(unit.domElement);
    }
  }
}
