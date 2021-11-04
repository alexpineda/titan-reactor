import GrpSDLegacy from "../../grp-sd-legacy";

// leverage our SD grp reader to render creep edges in SD
export const grpToCreepEdgesTextureAsync = async (creepGrp, palette) => {
  const stride = 37;
  const grpSD = new GrpSDLegacy();

  await grpSD.load(
    {
      readGrp: () => creepGrp,
      imageDef: {},
      palettes: [palette],
    },
    stride
  );

  return {
    texture: grpSD.texture,
    width: grpSD.width,
    height: grpSD.height,
  };
};
