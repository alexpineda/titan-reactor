class CanvasTarget {
  constructor(style = {}) {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, style);
    this.canvas = canvas;
  }

  getWidth() {
    return this.canvas.width;
  }

  getHeight() {
    return this.canvas.height;
  }

  getDeviceIndependentWidth() {
    return this.deviceIndependentWidth;
  }

  getDeviceIndependentHeight() {
    return this.deviceIndependentHeight;
  }

  setDimensions(width, height) {
    this.deviceIndependentWidth = width;
    this.deviceIndependentHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getContext() {
    return this.canvas.getContext("2d");
  }
}

export default CanvasTarget;
