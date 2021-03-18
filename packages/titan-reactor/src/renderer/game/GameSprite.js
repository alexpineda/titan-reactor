import { Object3D } from "three";
import SelectionCircle from "./SelectionCircle";

export default class GameSprite extends Object3D {
  constructor(index) {
    super();
    this.index = index;
    this.images = new Map();
    this.selectionCircle = new SelectionCircle();
  }

  select(spriteType) {
    this.selectionCircle.update(spriteType);
    this.selectionCircle.renderOrder = this.renderOrder - 1;
    this.add(this.selectionCircle);
  }

  unselect() {
    this.remove(this.selectionCircle);
  }
}
