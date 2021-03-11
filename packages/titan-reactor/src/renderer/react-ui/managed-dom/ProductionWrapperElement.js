import { range } from "ramda";
import ProductionElement from "./ProductionElement";

export default class ProductionWrapperElement {
  constructor(cmdIcons, color) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex", "ml-6");
    this.items = range(0, 10).map(() => new ProductionElement(cmdIcons, color));
    for (const unit of this.items) {
      this.domElement.append(unit.domElement);
    }
  }
}
