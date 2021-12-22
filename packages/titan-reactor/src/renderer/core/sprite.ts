import { Object3D } from "three";

import { SpriteDAT } from "../../common/types";
import SelectionBars from "./selection-bars";
import SelectionCircle from "./selection-circle";
import { UpgradeCompleted } from "../../common/types/production";
import { Unit, Image } from ".";

//@todo create interface that TitanSprite can implement
/**
 * The wrapper object for a bw sprite, contains images as well as selection circles and health bars
 */
export class Sprite extends Object3D {
  index: number;
  images: Map<number, Image> = new Map();
  selectionCircle = new SelectionCircle();
  selectionBars = new SelectionBars();
  lastZOff = 0;
  spriteDAT: SpriteDAT;

  //@todo refactor
  unit?: Unit;

  constructor(index: number, spriteDAT: SpriteDAT) {
    super();
    this.index = index;
    this.spriteDAT = spriteDAT;
  }

  select(completedUpgrades: UpgradeCompleted[]) {
    this.selectionCircle.update(this.spriteDAT as SpriteDAT);
    this.selectionCircle.renderOrder = this.renderOrder - 1;
    this.selectionBars.update(
      this,
      completedUpgrades,
      this.renderOrder,
      this.selectionCircle.grp.height / 256
    );
    this.add(this.selectionCircle);
    this.add(this.selectionBars);
  }

  unselect() {
    this.remove(this.selectionCircle);
    this.remove(this.selectionBars);
  }
}
export default Sprite;
