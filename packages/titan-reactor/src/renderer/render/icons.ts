import GameIcons from "../../common/image/generate-icons/game-icons";
import generateIcons from "../../common/image/generate-icons/generate-icons";
import { ReadFile } from "../../common/types";

class Icons {
  gameIcons?: GameIcons;
  cmdIcons?: GameIcons;
  raceInsetIcons?: GameIcons;
  workerIcons?: GameIcons;
  arrowIcons?: GameIcons;
  hoverIcons?: GameIcons;
  dragIcons?: GameIcons;
  wireframeIcons?: GameIcons;

  async generate(readFile: ReadFile) {
    const [
      gameIcons,
      cmdIcons,
      raceInsetIcons,
      workerIcons,
      arrowIcons,
      hoverIcons,
      dragIcons,
      wireframeIcons,
    ] = await generateIcons(readFile);

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
