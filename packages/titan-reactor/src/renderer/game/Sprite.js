import { Object3D } from "three";

export default class Sprite extends Object3D {
  constructor(index) {
    super();
    this.index = index;
    this.images = new Map();
  }
}
