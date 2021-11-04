import { Object3D } from "three";

import { ImageInstance } from "../../common/image";
import { SpriteDATType } from "../../common/types";
import SelectionBars from "./selection-bars";
import SelectionCircle from "./selection-circle";
import { UpgradeCompleted } from "./unit-instance";

const typeIds = ({ typeId }: { typeId: number }) => typeId;

//@todo create interface that TitanSprite can implement
/**
 * The wrapper object for a bw sprite, contains images as well as selection circles and health bars
 */
export class SpriteInstance extends Object3D {
  index: number;
  images: Map<number, ImageInstance> = new Map();
  selectionCircle = new SelectionCircle();
  selectionBars = new SelectionBars();
  lastZOff = 0;
  spriteType?: SpriteDATType;

  constructor(index: number) {
    super();
    this.index = index;
  }

  select(completedUpgrades: UpgradeCompleted[]) {
    this.selectionCircle.update(this.spriteType as SpriteDATType);
    this.selectionCircle.renderOrder = this.renderOrder - 1;
    this.selectionBars.update(
      this,
      completedUpgrades.map(typeIds),
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
export default SpriteInstance;
