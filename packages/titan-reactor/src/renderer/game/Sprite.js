import { Object3D } from "three";

export default class Sprite extends Object3D {
  constructor() {
    super();
    this.images = new Map();
  }
}
