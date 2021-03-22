import { range } from "ramda";
import SmallUnitDetailElement from "./SmallUnitDetailElement";

export default class SmallUnitDetailWrapperElement {
  constructor(wireframeIcons) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex", "justify-center");

    this.itemsContainer = document.createElement("div");
    this.itemsContainer.classList.add("flex", "flex-wrap");
    this.domElement.appendChild(this.itemsContainer);

    this.items = range(0, 12).map(
      () => new SmallUnitDetailElement(wireframeIcons)
    );

    for (const item of this.items) {
      this.itemsContainer.append(item.domElement);
    }
  }
}
