import { DAT } from "./DAT";
export class ImagesDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.statFile = `${process.env.BWDATA}/arr/images.tbl`;

    this.format = [
      { size: 4, name: "GRPFile", get: this._statTxt() },
      { size: 1, name: "GfxTurns" },
      { size: 1, name: "Clickable" },
      { size: 1, name: "UseFullIscript" },
      { size: 1, name: "DrawIfCloaked" },
      { size: 1, name: "DrawFunction", get: this._infoValue("DrawList") },
      { size: 1, name: "Remapping", get: this._infoValue("Remapping") },
      { size: 4, name: "IscriptID", get: this._infoValue("IscriptIDList") },
      { size: 4, name: "ShieldOverlay", get: this._statTxt() },
      { size: 4, name: "AttackOverlay", get: this._statTxt() },
      { size: 4, name: "DamageOverlay", get: this._statTxt() },
      { size: 4, name: "SpecialOverlay", get: this._statTxt() },
      { size: 4, name: "LandingDustOverlay", get: this._statTxt() },
      { size: 4, name: "LiftOffDustOverlay", get: this._statTxt() },
    ];

    this.datname = "images.dat";
    this.idfile = "Images.txt";
    this.filesize = 37962;
    this.count = 999;
  }
}
