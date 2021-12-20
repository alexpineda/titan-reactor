import { AnimSprite, AnimSpriteRef, BwDAT } from "../../types";
import Atlas3D from "./atlas-3d";

type ReadFile = (file: string) => Promise<Buffer>;

function isSpriteRef(sprite: any): sprite is AnimSpriteRef {
  return "refId" in sprite;
}
export class AtlasLoader {
  private bwDat: BwDAT;
  private bwDataPath: string;
  private readFile: ReadFile;
  private sdAnimSprites: (AnimSprite | AnimSpriteRef)[];

  constructor(
    bwDat: BwDAT,
    bwDataPath: string,
    readFile: ReadFile,
    sdAnimSprites: (AnimSprite | AnimSpriteRef)[]
  ) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.readFile = readFile;
    this.sdAnimSprites = sdAnimSprites;
  }

  private refId(id: number) {
    if (isSpriteRef(this.sdAnimSprites[id])) {
      return this.sdAnimSprites[id].refId;
    }
    return id;
  }

  private readAnim(id: number) {
    return this.readFile(`anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);
  }

  private readAnimHD2(id: number) {
    return this.readFile(
      `HD2/anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`
    );
  }

  async load(imageId: number) {
    const grp = new Atlas3D();
    return await grp.load({
      imageDef: this.bwDat.images[imageId],
      readAnim: () => this.readAnim(imageId),
      readAnimHD2: () => this.readAnimHD2(imageId),
      glbFileName: `${this.bwDataPath}/models/${`00${this.refId(
        imageId
      )}`.slice(-3)}.glb`,
    });
  }
}
export default AtlasLoader;
