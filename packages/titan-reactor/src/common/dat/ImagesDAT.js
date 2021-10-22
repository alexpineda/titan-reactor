import { DAT } from "./DAT";
import ImageListDefiniton from "./Data/ImageListDefiniton.js";

export class ImagesDAT extends DAT {
  constructor(readFile) {
    super(readFile);

    this.statFile = "arr/images.tbl";

    this.format = [
      {
        size: 4,
        name: "grp",
      },
      { size: 1, name: "gfxTurns" },
      { size: 1, name: "clickable" },
      { size: 1, name: "useFullIscript" },
      { size: 1, name: "drawIfCloaked" },
      { size: 1, name: "drawFunction" },
      { size: 1, name: "remapping" },
      { size: 4, name: "iscript" },
      { size: 4, name: "shieldOverlay" },
      { size: 4, name: "attackOverlay" },
      { size: 4, name: "damageOverlay" },
      { size: 4, name: "specialOverlay" },
      { size: 4, name: "landingDustOverlay" },
      { size: 4, name: "liftOffDustOverlay" },
    ];

    this.datname = "images.dat";
    this.filesize = 37962;
    this.count = 999;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
      entry.grpFile = this._statTxt()(entry.grp);
      entry.name = ImageListDefiniton[i];
    });
  }
}
