import { Object3D } from "three";
import SelectionCircle from "./SelectionCircle";
import SelectionBars from "./SelectionBars";

const typeIds = ({ typeId }) => typeId;
export default class GameSprite extends Object3D {
  constructor(index) {
    super();
    this.index = index;
    this.images = new Map();
    this.selectionCircle = new SelectionCircle();
    this.selectionBars = new SelectionBars();
  }

  update() {
    if (this.selectionBars.visible) {
      this.selectionBars.updateValues(this);
    }
  }

  select(completedUpgrades) {
    this.selectionCircle.update(this.spriteType);
    this.selectionCircle.renderOrder = this.renderOrder - 1;
    this.add(this.selectionCircle);

    this.selectionBars.update(
      this,
      completedUpgrades.map(typeIds),
      this.renderOrder,
      this.selectionCircle.grp.height / 256
    );
    this.add(this.selectionBars);
  }

  unselect() {
    this.remove(this.selectionCircle);
    this.remove(this.selectionBars);
  }
}
