export class Surface {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  #pixelRatio = 1;
  #width = 0;
  #height = 0;
  #bufferWidth = 0;
  #bufferHeight = 0;

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
    this.#pixelRatio = pixelRatio;
    this.#width = width;
    this.#height = height;
    this.#bufferWidth = Math.floor(this.#width * pixelRatio);
    this.#bufferHeight = Math.floor(this.#height * pixelRatio);
    this.canvas.width = this.#bufferWidth;
    this.canvas.height = this.#bufferHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  get aspect() {
    return this.width / this.height
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get bufferWidth() {
    return this.#bufferWidth;
  }

  get bufferHeight() {
    return this.#bufferHeight;
  }

  get pixelRatio() {
    return this.#pixelRatio;
  }

  getContext() {
    return this.canvas.getContext("2d");
  }

  dispose() {
    this.canvas.remove();
  }
}

export default Surface;
