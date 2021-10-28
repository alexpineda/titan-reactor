import { Object3D } from "three";

import { ImageInstance } from "../../common/image";
import { SpriteDATType } from "../../common/types";
import SelectionBars from "./SelectionBars";
import SelectionCircle from "./SelectionCircle";
import { UpgradeCompleted } from "./UnitInstance";

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
    this.add(this.selectionCircle);
    this.add(this.selectionBars);
    this.unselect();
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
    this.selectionCircle.visible = true;
    this.selectionBars.visible = true;
  }

  unselect() {
    this.selectionBars.visible = false;
    this.selectionCircle.visible = false;
  }
}
export default SpriteInstance;
