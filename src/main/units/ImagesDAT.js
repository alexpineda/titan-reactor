import { DAT } from "./DAT";

export class ImagesDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.statFile = `${bwDataPath}/arr/images.tbl`;

    this.format = [
      {
        size: 4,
        name: "grpFile",
        get: (index) => {
          const grpFile = this._statTxt()(index);
          //remove null from end
          return grpFile.substr(0, grpFile.length - 1);
        },
      },
      { size: 1, name: "gfxTurns" },
      { size: 1, name: "clickable" },
      { size: 1, name: "useFullIscript" },
      { size: 1, name: "drawIfCloaked" },
      { size: 1, name: "drawFunction", get: this._infoValue("DrawList") },
      { size: 1, name: "remapping" },
      { size: 4, name: "iscript" },
      { size: 4, name: "shieldOverlay", get: this._statTxt() },
      { size: 4, name: "attackOverlay", get: this._statTxt() },
      { size: 4, name: "damageOverlay", get: this._statTxt() },
      { size: 4, name: "specialOverlay", get: this._statTxt() },
      { size: 4, name: "landingDustOverlay", get: this._statTxt() },
      { size: 4, name: "liftOffDustOverlay", get: this._statTxt() },
    ];

    this.datname = "images.dat";
    this.idfile = "Images.txt";
    this.filesize = 37962;
    this.count = 999;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
