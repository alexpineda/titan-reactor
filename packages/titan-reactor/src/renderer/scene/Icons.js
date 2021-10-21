import generateIcons from "../../common/image/generateIcons";
import readCascFile from "../../common/utils/casclib";

class Icons {
  async generate() {
    const [
      gameIcons,
      cmdIcons,
      raceInsetIcons,
      workerIcons,
      arrowIcons,
      hoverIcons,
      dragIcons,
      wireframeIcons,
    ] = await generateIcons(readCascFile);

    this.gameIcons = gameIcons;
    this.cmdIcons = cmdIcons;
    this.raceInsetIcons = raceInsetIcons;
    this.workerIcons = workerIcons;
    this.arrowIcons = arrowIcons;
    this.hoverIcons = hoverIcons;
    this.dragIcons = dragIcons;
    this.wireframeIcons = wireframeIcons;
  }
}

export default Icons;
