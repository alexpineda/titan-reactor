import { range } from "ramda";

const blank64 =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default class UnitQueue {
  constructor(icons) {
    this.icons = icons;
    this.domElement = document.createElement("div");
    this.domElement.classList.add("items-end", "w-full");
    this.domElement.style.height = "48px";

    this.items = range(0, 5).map(() => document.createElement("img"));
    this.items.forEach((img, i) => {
      img.style.width = "32px";
      img.style.height = "32px";
      img.classList.add("rounded", "border", "border-gray-600");
      if (i < 4) {
        img.classList.add("mr-1");
      }
      this.domElement.appendChild(img);
    });
    this.items[0].style.width = "40px";
    this.items[0].style.height = "40px";
  }

  update(unit, queuedZergUnitType) {
    if (
      unit.unitType.isBuilding &&
      !unit.unitType.isZerg &&
      unit.unitType.producesUnits &&
      unit.isComplete
    ) {
      for (let i = 0; i < 5; i++) {
        this.items[i].classList.add("border");
        if (unit.queue && unit.queue.units[i] !== undefined) {
          this.items[i].src = this.icons[unit.queue.units[i]];
        } else {
          this.items[i].src = blank64;
        }
      }
      this.domElement.style.display = "flex";
    } else if (queuedZergUnitType) {
      for (let i = 1; i < 5; i++) {
        this.items[i].classList.remove("border");
        this.items[i].src = blank64;
      }
      this.items[0].src = this.icons[queuedZergUnitType.index];
      this.domElement.style.display = "flex";
    } else {
      this.domElement.style.display = "none";
    }
    this._value = unit;
  }

  hide() {
    this.domElement.style.display = "none";
  }
}
