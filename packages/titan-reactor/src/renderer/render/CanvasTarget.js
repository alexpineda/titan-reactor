class CanvasTarget {
  constructor(style = {}) {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, style);
    this.canvas = canvas;
  }

  setDimensions(width, height, pixelRatio = 1) {
    this.pixelRatio = pixelRatio;
    this.width = width;
    this.height = height;
    this.scaledWidth = Math.floor(width * pixelRatio);
    this.scaledHeight = Math.floor(height * pixelRatio);
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
