import { Object3D } from "three";

import { SpriteDAT } from "../../common/types";
import SelectionBars from "./selection-bars";
import SelectionCircle from "./selection-circle";
import { UpgradeCompleted } from "../../common/types/production";
import { CrapUnit, Image } from ".";

/**
 * Object3D representing a game sprite. Contains images as well as selection circles and health bars
 */
export class Sprite extends Object3D {
  index: number;
  selectionCircle = new SelectionCircle();
  selectionBars = new SelectionBars();
  lastZOff = 0;
  dat: SpriteDAT;

  // used for mouse interaction
  mainImage?: Image;

  constructor(index: number, spriteDAT: SpriteDAT) {
    super();
    this.index = index;
    this.dat = spriteDAT;
  }

  select() {
    this.selectionCircle.update(this.dat as SpriteDAT);
    this.selectionCircle.renderOrder = this.renderOrder - 1;
    // this.selectionBars.update(
    //   this,
    //   completedUpgrades,
    //   this.renderOrder,
    //   this.selectionCircle.grp.height / 256
    // );
    this.add(this.selectionCircle);
    // this.add(this.selectionBars);
  }

  unselect() {
    this.selectionCircle.removeFromParent();
    this.selectionBars.removeFromParent();
  }
}
export default Sprite;
