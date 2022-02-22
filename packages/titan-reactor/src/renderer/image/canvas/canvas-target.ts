export class CanvasTarget {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  pixelRatio = 1;
  width = 0;
  height = 0;
  scaledWidth = 0;
  scaledHeight = 0;

  constructor(defaultCanvas?: HTMLCanvasElement) {
    const canvas = defaultCanvas || document.createElement("canvas");
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    this.ctx = ctx;
    this.canvas = canvas;
  }

  setDimensions(width: number, height: number, pixelRatio = 1) {
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
