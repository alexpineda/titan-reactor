import { Surface } from "@image/canvas";
import {
  MathUtils,
  Vector2,
  Vector4,
} from "three";

const isNumber = (value: any): value is number => {
  return typeof value === "number";
};

class RatioValue {
    maxValue = 0;
    #value: null | number = null;
    #ratio = false;

    constructor(maxValue: number) {
        this.maxValue = maxValue;
    }

    set value(val: number | null) {
      this.#value = val;
      this.#ratio = typeof val === "number" && val <= 1;
      if (this.#value === null && this.#ratio) {
        throw new Error("Cannot set ratio value to null");
      }
    }

    get value() {
      return this.#ratio ? (this.#value! * this.maxValue) : this.#value;
    }
}

/** 
 * A class that can be used to set the size and location of a surface on the screen.
*/
export class Sizeable {

  #aspect: null | number = null;

  #height = new RatioValue(0);
  #width = new RatioValue(0);
  #left = new RatioValue(0);
  #right = new RatioValue(0);
  #top = new RatioValue(0);
  #bottom = new RatioValue(0);

  #center: Vector2 | null = null;
  #surface: Surface;

  #actual = new Vector4();

  constructor(surface: Surface) {
    this.#surface = surface;
    this.#updateMaxValues();
  }

  #updateMaxValues() {
    this.#height.maxValue = this.#surface.bufferHeight;
    this.#width.maxValue = this.#surface.bufferWidth;
    this.#left.maxValue = this.#surface.bufferWidth;
    this.#right.maxValue = this.#surface.bufferWidth;
    this.#top.maxValue = this.#surface.bufferHeight;
    this.#bottom.maxValue = this.#surface.bufferHeight;
  }

  set center(val: Vector2 | null) {
    this.#center = val;
  }

  get center() {
    return this.#center;
  }

  get height() {
    return this.#height.value;
  }

  set height(val: number | null) {
    this.#height.value = val;
  }

  set width(val: number | null) {
    this.#width.value = val;
  }

  get width() {
    return this.#width.value;
  }

  get left() {
    return this.#left.value;
  }

  set left(val: number | null) {
    this.#left.value = val;
  }

  set right(val: number | null) {
    this.#right.value = val;
  }

  get right() {
    return this.#right.value;
  }

  get top() {
    return this.#top.value;
  }

  set top(val: number | null) {
    this.#top.value = val;
  }

  set bottom(val: number | null) {
    this.#bottom.value = val;
  }

  get bottom() {
    return this.#bottom.value;
  }

  get aspect(): number {
    return this.#aspect ?? this.#surface.aspect;
  }

  set aspect(val: number | null) {
    this.#aspect = val;
  }

  getActualSize() {
    this.#updateMaxValues();

    let width = isNumber(this.left) && isNumber(this.right) ? this.#surface.bufferWidth - this.left - this.right : this.width;
    let height = isNumber(this.top) && isNumber(this.bottom) ? this.#surface.bufferHeight - this.top - this.bottom : this.height;

    // constrain aspect
    if (width === null || height === null) {
      if (height) {
        width = height * this.aspect;
      } else if (width) {
        height = width / this.aspect;
      }
    }

    if (width === null || height === null) {
      throw new Error("Cannot have null width or height");
    }

    if (this.center) {
      const x = this.center.x - width / 2;
      const y = this.#surface.bufferHeight - this.center.y - height / 2;

      this.#actual.set(
        MathUtils.clamp(x, width / 2, this.#surface.bufferWidth - height / 2),
        MathUtils.clamp(y, height / 2, this.#surface.bufferHeight - height / 2),
        width,
        height
      );

    } else {
      let x = 0,
        y = 0;

      if (isNumber(this.left) && !isNumber(this.right)) {
        x = this.left;
      } else if (isNumber(this.right) && !isNumber(this.left)) {
        x = this.#surface.bufferWidth - width - this.right;
      } else if (isNumber(this.left) && isNumber(this.right)) {
        x = this.left;
      }

      if (isNumber(this.bottom) && !isNumber(this.top)) {
        y = this.bottom;
      } else if (isNumber(this.top) && !isNumber(this.bottom)) {
        y = this.#surface.bufferHeight - height - this.top;
      } else if (isNumber(this.bottom) && isNumber(this.top)) {
        y = this.bottom;
      }

      this.#actual.set(x, y, width, height);
    }
    
    return this.#actual;
  }

  fullScreen() {
    this.width = 1;
    this.height = 1;
  }
}
