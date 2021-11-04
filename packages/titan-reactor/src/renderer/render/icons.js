import generateIcons from "../../common/image/generate-icons/generate-icons";
import { openCasclibFile } from "../ipc";

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
    ] = await generateIcons(openCasclibFile);

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
