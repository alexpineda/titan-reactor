function findDescriptor(obj, prop) {
  if (obj != null) {
    return Object.hasOwnProperty.call(obj, prop)
      ? Object.getOwnPropertyDescriptor(obj, prop)
      : findDescriptor(Object.getPrototypeOf(obj), prop);
  }
}

class CanvasTarget {
  constructor(style = {}) {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, style);
    this.ctx = canvas.getContext("2d");
    canvas.disableCanvasResize = false;
    // this.canvas = new Proxy(canvas, {
    //   get(target, key) {
    //     let value = Reflect.get(target, key);
    //     return typeof value == "function" ? value.bind(target) : value;
    //   },

    //   set(target, prop, val) {
    //     if (
    //       target.disableCanvasResize &&
    //       (prop === "width" || prop === "height")
    //     ) {
    //       return true;
    //     }
    //     return Reflect.set(target, prop, val);
    //   },
    // });

    const oWidth = findDescriptor(canvas, "width");
    const oHeight = findDescriptor(canvas, "height");

    Object.defineProperty(canvas, "width", {
      configurable: true,
      enumerable: true,

      get() {
        return oWidth.get.call(this);
      },

      set(value) {
        if (!canvas.disableCanvasResize) {
          return oWidth.set.call(this, value);
        }
      },
    });

    Object.defineProperty(canvas, "height", {
      configurable: true,
      enumerable: true,

      get() {
        return oHeight.get.call(this);
      },

      set(value) {
        if (!canvas.disableCanvasResize) {
          return oHeight.set.call(this, value);
        }
      },
    });

    this.canvas = canvas;
  }

  setDimensions(width, height, pixelRatio = 1) {
    this.dirty = true;
    this.pixelRatio = pixelRatio;
    this.width = width;
    this.height = height;
    // this.width = (width * 3) / 4;
    // this.height = (height * 3) / 4;
    this.scaledWidth = Math.floor(this.width * pixelRatio);
    this.scaledHeight = Math.floor(this.height * pixelRatio);
    this.canvas.width = this.scaledWidth;
    this.canvas.height = this.scaledHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  getContext() {
    return this.canvas.getContext("2d");
  }
}

export default CanvasTarget;
