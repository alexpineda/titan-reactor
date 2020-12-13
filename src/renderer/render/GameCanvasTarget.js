import CanvasTarget from "./CanvasTarget";

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
    const producerWindow = "off";
    const producerScreenSize = "4:3";
    const producerBarSize = 300;

    let width = screenWidth;

    if (producerWindow === "left" || producerWindow === "right") {
      width = screenWidth - producerBarSize;
    }

    const aspects = {
      native: screen.width / screen.height,
      "4:3": 4 / 3,
      "16:9": 16 / 9,
      fit: width / screenHeight,
    };

    const aspect = aspects[producerScreenSize];
    let height = width / aspect;
    this.top = (screenHeight - height) / 2;

    super.setDimensions(width, height);
  }
}

export default GameCanvasTarget;
