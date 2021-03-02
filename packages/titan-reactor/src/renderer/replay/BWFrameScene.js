import { range } from "ramda";
import { Group } from "three";
import Sprite from "./Sprite";

class BWGroup extends Group {
  constructor() {
    super();
  }
}

export default class BWFrameScene {
  constructor(scene, count = 2) {
    this.scene = scene;
    this.count = count;
    this.groups = range(0, count).map(() => new BWGroup());
    this.index = 0;
  }

  add(sprite) {
    this.group.add(sprite);
  }

  clear() {
    this.group.clear();
  }

  swap() {
    this.index = (this.index + 1) % this.count;
    this._prevGroup = this.group;
    this.group = this.groups[this.index];
    this.clear();
  }

  activate() {
    if (this.group === this.activeGroup) {
      return;
    }

    this.scene.remove(this._prevGroup);
    this.scene.add(this.group);
    this.activeGroup = this.group;
  }
}
