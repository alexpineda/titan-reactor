import CanvasTarget from "./CanvasTarget";

const ProducerWindowPosition = {
  None: "None",
  DockLeft: "DockLeft",
  DockRight: "DockRight",
  PopOut: "PopOut",
};

const ProducerGameAspect = {
  Fit: "Fit",
  Native: "Native",
  FourThree: "FourThree",
  SixteenNine: "SixteenNine",
};

class GameCanvasTarget extends CanvasTarget {
  constructor(context) {
    super();
    this.context = context;
    this.top = 0;
    this.left = 0;
  }

  //producer window - OFF, DOCK LEFT, DOCK RIGHT, POPUP
  //producer screen size - constrain 4:3, 16:9, Native Aspect, Fit, SPECIFIC
  setDimensions(screenWidth, screenHeight) {
    const producerWindowPosition = ProducerWindowPosition.DockLeft;
    const producerGameAspect = ProducerGameAspect.FourThree;
    const producerBarSize = 300;

    const maxWidth =
      producerWindowPosition === ProducerWindowPosition.DockLeft ||
      producerWindowPosition === ProducerWindowPosition.DockRight
        ? screenWidth - producerBarSize
        : screenWidth;
    const maxHeight = screenHeight;

    const aspects = {
      [ProducerGameAspect.Native]: screen.width / screen.height,
      [ProducerGameAspect.FourThree]: 4 / 3,
      [ProducerGameAspect.SixteenNine]: 16 / 9,
    };

    this.left =
      producerWindowPosition === ProducerWindowPosition.DockLeft
        ? producerBarSize
        : 0;

    this.right =
      producerWindowPosition === ProducerWindowPosition.DockRight
        ? producerBarSize
        : 0;

    if (producerGameAspect === ProducerGameAspect.Fit) {
      this.top = 0;

      super.setDimensions(maxWidth, maxHeight);
    } else {
      const aspect = aspects[producerGameAspect];
      let width = maxWidth;
      if (width / aspect > maxHeight) {
        width = maxHeight * aspect;
      }

      const height = width / aspect;

      this.top = (maxHeight - height) / 2;
      this.left = this.left + (maxWidth - width) / 2;
      this.right = this.right + (maxWidth - width) / 2;

      super.setDimensions(width, height);
    }
  }

  getRect() {
    return {
      left: this.left,
      top: this.top,
      right: window.innerWidth - (this.width + this.left),
      bottom: window.innerHeight - (this.height + this.top),
      width: this.width,
      height: this.height,
    };
  }
}

export default GameCanvasTarget;
