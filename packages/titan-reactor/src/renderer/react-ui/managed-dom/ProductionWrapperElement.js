import { range } from "ramda";
import ProductionElement from "./ProductionElement";

export default class ProductionWrapperElement {
  constructor(cmdIcons, color, compact = false) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex", "ml-6");
    this.items = range(0, 10).map(
      () => new ProductionElement(cmdIcons, color, compact)
    );
    for (const unit of this.items) {
      this.domElement.append(unit.domElement);
    }
  }
}
