import { CanvasTarget } from "../../common/image";
import { Settings, GameAspect } from "../../common/types";

const MinimapRatio = .25;

export class GameCanvasTarget extends CanvasTarget {
  minimapSize = 0;
  top = 0;
  left = 0;
  right = 0;
  bottom = 0;
  aspect = 0;
  //@todo refactor out
  private settings: Settings;

  constructor(settings: Settings) {
    super();
    this.settings = settings;
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

    if (gameAspect === GameAspect.Fit) {
      this.top = 0;

      super.setDimensions(
        Math.floor(maxWidth - 2),
        Math.floor(maxHeight - 2),
        this.settings.graphics.pixelRatio
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
        this.settings.graphics.pixelRatio
      );
    }

    this.minimapSize = this.height * MinimapRatio;
  }

  getRect() {
    return {
      left: this.left,
      top: this.top,
      right: window.innerWidth - (this.width + this.left),
      bottom: window.innerHeight - (this.height + this.top),
      width: this.width,
      height: this.height,
      minimapSize: this.minimapSize,
    };
  }
}

export default GameCanvasTarget;
