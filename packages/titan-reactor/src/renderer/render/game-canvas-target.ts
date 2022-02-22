import { Settings, GameAspect, GameCanvasDimensions } from "common/types";
import { CanvasTarget } from "../image";

const MinimapRatio = .25;

export class GameCanvasTarget extends CanvasTarget {
  top = 0;
  left = 0;
  right = 0;
  bottom = 0;
  aspect = 0;
  private _settings: Settings;
  private _mapWidth: number;
  private _mapHeight: number;

  constructor(settings: Settings, mapWidth: number, mapHeight: number) {
    super();
    this._settings = settings;
    this._mapHeight = mapHeight;
    this._mapWidth = mapWidth;
  }

  override setDimensions(screenWidth: number, screenHeight: number) {
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

    const pixelRatios = {
      high: window.devicePixelRatio,
      med: 1,
      low: 0.75
    };

    if (gameAspect === GameAspect.Fit) {
      this.top = 0;

      super.setDimensions(
        Math.floor(maxWidth - 2),
        Math.floor(maxHeight - 2),
        pixelRatios[this._settings.graphics.pixelRatio]
      );

    } else {
      const aspect = aspects[gameAspect];
      this.aspect = aspect;
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
        pixelRatios[this._settings.graphics.pixelRatio]
      );
    }
  }

  requestPointerLock() {
    this.canvas.requestPointerLock();
  }

  exitPointerLock() {
    document.exitPointerLock();
  }

  getRect(): GameCanvasDimensions {
    const max = Math.max(this._mapWidth, this._mapHeight);
    const wAspect = this._mapWidth / max;
    const hAspect = this._mapHeight / max;
    const minimapSize = this.height * MinimapRatio;

    return {
      left: this.left,
      top: this.top,
      right: window.innerWidth - (this.width + this.left),
      bottom: window.innerHeight - (this.height + this.top),
      width: this.width,
      height: this.height,
      minimapWidth: Math.floor(minimapSize * wAspect),
      minimapHeight: Math.floor(minimapSize * hAspect)
    };
  }
}

export default GameCanvasTarget;
