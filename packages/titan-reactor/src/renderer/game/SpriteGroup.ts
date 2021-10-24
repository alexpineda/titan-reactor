import { Object3D } from "three";
import SelectionCircle from "./SelectionCircle";
import SelectionBars from "./SelectionBars";
import TitanImageHD from "../../common/image/TitanImageHD";
import { SpriteDATType } from "../../common/dat/SpritesDAT";

const typeIds = ({ typeId }: {typeId: number}) => typeId;

/**
 * The wrapper object for a bw sprite, contains images as well as selection circles and health bars
 */
export default class SpriteGroup extends Object3D {
  index: number;
  images: Map<number, TitanImageHD> = new Map();
  selectionCircle = new SelectionCircle;
  selectionBars = new SelectionBars;
  lastZOff = 0;
  spriteType?:SpriteDATType;

  constructor(index: number) {
    super();
    this.index = index;
  }

  update() {
    if (this.selectionBars.visible) {
      this.selectionBars.updateValues(this);
    }
  }

  select(completedUpgrades: any) {
    this.selectionCircle.update(this.spriteType as SpriteDATType);
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
