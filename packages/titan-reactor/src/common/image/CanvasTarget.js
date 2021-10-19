class CanvasTarget {
  constructor(defaultCanvas) {
    const canvas = defaultCanvas || document.createElement("canvas");
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
  }

  setDimensions(width, height, pixelRatio = 1) {
    this.pixelRatio = pixelRatio;
    this.width = width;
    this.height = height;
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
