import { range } from "ramda";
import { Group } from "three";

class BWGroup extends Group {
  constructor() {
    super();
    this.sounds = [];
    this.sprites = new Map();
    this.images = new Map();
    this.units = new Map();
    this.unitsBySpriteId = new Map();
  }
}

export default class BWFrameScene {
  constructor(scene, count = 2) {
    this.scene = scene;
    this.count = count;
    this.groups = range(0, count).map(() => new BWGroup());
    this.index = 0;
    this._playSound = (channel) => {
      channel.play();
    };
  }

  add(object) {
    if (object.isObject3D) {
      this.group.add(object);
    } else {
      this.group.sounds.push(object);
    }
  }

  clear() {
    this.group.clear();
    // let toRemove = [...this.group.children];
    // for (const child of toRemove) {
    //   this.group.remove(child);
    // }
    this.group.sounds = [];
  }

  play() {
    for (let sound of this.group.sounds) {
      sound.then(this._playSound).catch(() => {});
    }
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

  get sprites() {
    return this.group.sprites;
  }

  get images() {
    return this.group.images;
  }

  get units() {
    return this.group.units;
  }

  get unitsBySpriteId() {
    return this.group.unitsBySpriteId;
  }
}
