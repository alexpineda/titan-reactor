import CanvasTarget from "../../common/image/CanvasTarget";
import { GameAspect, ProducerWindowPosition } from "../../common/settings";

class GameCanvasTarget extends CanvasTarget {
  constructor(settings) {
    super();
    this.settings = settings;
    this.top = 0;
    this.left = 0;
  }

  setDimensions(screenWidth, screenHeight) {
    const producerWindowPosition = this.settings.producerWindowPosition;
    const gameAspect =
      producerWindowPosition === ProducerWindowPosition.None
        ? GameAspect.Fit
        : this.settings.gameAspect;
    const producerDockSize = this.settings.producerDockSize;

    const maxWidth =
      producerWindowPosition === ProducerWindowPosition.DockLeft ||
      producerWindowPosition === ProducerWindowPosition.DockRight
        ? screenWidth - producerDockSize
        : screenWidth;
    const maxHeight = screenHeight;

    const aspects = {
      [GameAspect.Native]: screen.width / screen.height,
      [GameAspect.FourThree]: 4 / 3,
      [GameAspect.SixteenNine]: 16 / 9,
    };

    this.left =
      producerWindowPosition === ProducerWindowPosition.DockLeft
        ? producerDockSize
        : 0;

    this.right =
      producerWindowPosition === ProducerWindowPosition.DockRight
        ? producerDockSize
        : 0;

    if (gameAspect === GameAspect.Fit) {
      this.top = 0;

      super.setDimensions(
        Math.floor(maxWidth),
        Math.floor(maxHeight),
        this.settings.pixelRatio
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
        this.settings.pixelRatio
      );
    }

    this.minimapSize = (this.height * this.settings.minimapRatio) / 100;
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
