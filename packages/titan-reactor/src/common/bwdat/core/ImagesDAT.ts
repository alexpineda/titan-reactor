import { DAT, ReadFileType } from "./DAT";
import ImageListDefiniton from "./Data/ImageListDefiniton.js";

export type ImageDATType = {
  index: number;
  grpFile: string;
  name: string;

  grp: number;
  gfxTurns: number;
  clickable: number;
  useFullIscript: number;
  drawIfCloaked: number;
  drawFunction: number;
  remapping: number;
  iscript: number;
  shieldOverlay: number;
  attackOverlay: number;
  specialOverlay: number;
  landingDustOverlay: number;
  liftOffDustOverlay: number;
};

export class ImagesDAT extends DAT<ImageDATType> {
  constructor(readFile: ReadFileType) {
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
    this.count = 999;
  }

  override async load(): Promise<ImageDATType[]> {
    return super.load();
  }

  override post(entries: ImageDATType[]): ImageDATType[] {
    return entries.map((entry, i: number) => ({
      ...entry,
      index: i,
      grpFile: this._statTxt()(entry.grp),
      name: ImageListDefiniton[i],
    }));
  }
}
