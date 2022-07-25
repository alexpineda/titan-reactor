import { GameAspect, MinimapDimensions } from "common/types";
import { Surface } from "../image";

export class GameSurface extends Surface {
  top = 0;
  left = 0;
  right = 0;
  bottom = 0;

  #mapWidth: number;
  #mapHeight: number;
  #shouldHavePointerLock = false;

  constructor(mapWidth: number, mapHeight: number) {
    super();
    this.#mapHeight = mapHeight;
    this.#mapWidth = mapWidth;

    document.addEventListener('pointerlockerror', () => {
      this.#shouldHavePointerLock = false;
    });

  }

  override setDimensions(screenWidth: number, screenHeight: number, pixelRatio: number) {
    const gameAspect = GameAspect.Fit;

    const maxWidth = screenWidth;
    const maxHeight = screenHeight;

    const aspects = {
      [GameAspect.Native]: screen.width / screen.height,
      [GameAspect.FourThree]: 4 / 3,
      [GameAspect.SixteenNine]: 16 / 9,
    };

    this.left = 0;
    this.right = 0;

    if (gameAspect === GameAspect.Fit) {
      this.top = 0;
      this.bottom = 0;

      super.setDimensions(
        Math.floor(maxWidth - 2),
        Math.floor(maxHeight - 2),
        pixelRatio
      );

    } else {
      const aspect = aspects[gameAspect];
      let width = maxWidth;
      if (width / aspect > maxHeight) {
        width = maxHeight * aspect;
      }

      const height = width / aspect;

      this.top = (maxHeight - height) / 2;
      this.left = this.left + (maxWidth - width) / 2;
      this.right = this.right + (maxWidth - width) / 2;

      super.setDimensions(
        Math.floor(width),
        Math.floor(height),
        pixelRatio
      );
    }
  }

  get pointerLockInvalidState() {
    return this.#shouldHavePointerLock && document.pointerLockElement !== this.canvas;
  }

  togglePointerLock(val: boolean) {
    if (val) {
      this.requestPointerLock();
    } else {
      this.exitPointerLock();
    }
  }

  requestPointerLock() {
    this.#shouldHavePointerLock = true;
    this.canvas.requestPointerLock();
  }

  exitPointerLock() {
    this.#shouldHavePointerLock = false;
    document.exitPointerLock();
  }

  getMinimapDimensions(minimapRatio: number): MinimapDimensions {
    const max = Math.max(this.#mapWidth, this.#mapHeight);
    const wAspect = this.#mapWidth / max;
    const hAspect = this.#mapHeight / max;
    const minimapSize = this.height * minimapRatio;

    return {
      minimapWidth: Math.floor(minimapSize * wAspect),
      minimapHeight: Math.floor(minimapSize * hAspect)
    };
  }

  override dispose() {
    this.canvas.remove();
  }
}

export default GameSurface;
