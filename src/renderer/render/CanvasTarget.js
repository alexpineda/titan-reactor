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

  setDimensions(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getContext() {
    return this.canvas.getContext("2d");
  }
}

export default CanvasTarget;
