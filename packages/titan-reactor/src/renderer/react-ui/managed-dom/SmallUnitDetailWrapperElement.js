import { range } from "ramda";
import SmallUnitDetailElement from "./SmallUnitDetailElement";

const canSelect = (u) => u.canSelect;
const sumKills = (tkills, { kills }) => tkills + kills;

export default class SmallUnitDetailWrapperElement {
  constructor(wireframeIcons) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex", "flex-col", "pointer-events-auto");

    this.itemsContainer = document.createElement("div");
    this.itemsContainer.classList.add("flex", "flex-wrap", "pl-2", "pt-8");
    this.domElement.appendChild(this.itemsContainer);

    this.kills = document.createElement("div");
    this.kills.classList.add("text-white", "text-center", "w-full");
    this.domElement.appendChild(this.kills);

    this.items = range(0, 12).map(
      () => new SmallUnitDetailElement(wireframeIcons)
    );

    for (const item of this.items) {
      this.itemsContainer.append(item.domElement);
    }
  }

  updateKillCount(units) {
    this.kills.textContent = `Total Kills ${units
      .filter(canSelect)
      .reduce(sumKills, 0)}`;
  }
}
