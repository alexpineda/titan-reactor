import Grp3D from "./Grp3D";
import GrpHD from "./GrpHD";

export default class GrpFileLoader {
  constructor(bwDat, bwDataPath, readFile, sdAnim) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.readFile = readFile;
    this.sdAnim = sdAnim;
    this.palettes = null;

    this.refId = (id) => {
      if (this.sdAnim.sprites[id].refId !== undefined) {
        return this.sdAnim.sprites[id].refId;
      }
      return id;
    };

    this.readGrp = (id) =>
      readFile(`unit/${this.bwDat.images[id].grpFile.replace("\\", "/")}`);

    this.readSDAnim = (id) => ({
      ...this.sdAnim.sprites[this.refId(id)],
      buf: this.sdAnim.buf,
    });

    this.readAnim = (id) =>
      readFile(`anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);

    this.readAnimHD2 = (id) =>
      readFile(`HD2/anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);
  }

  async load(imageId) {
    const img = {
      imageDef: this.bwDat.images[imageId],
      readAnim: () => this.readAnim(imageId),
      readAnimHD2: () => this.readAnimHD2(imageId),
      glbFileName: `${this.bwDataPath}/models/${`00${this.refId(
        imageId
      )}`.slice(-3)}.glb`,
    };

    const grp = new Grp3D();
    return await grp.load(img);
  }
}
