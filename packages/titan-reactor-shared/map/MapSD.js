import GrpSD from "../image/GrpSD";

export default class MapSD {
  static async renderCreepTexture(creepGrp, palette) {
    const stride = 7;
    const grpSD = new GrpSD();
    await grpSD.load(
      {
        readGrp: () => creepGrp,
        imageDef: {},
        palettes: [palette],
      },
      stride
    );
    return grpSD.texture;
  }
}
