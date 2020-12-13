class CanvasTarget {
  constructor(style = {}) {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, style);
    this.canvas = canvas;
  }

  setDimensions(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.scaledWidth = width * window.devicePixelRatio;
    this.scaledHeight = height * window.devicePixelRatio;
  }

  getContext() {
    return this.canvas.getContext("2d");
  }
}

export default CanvasTarget;
