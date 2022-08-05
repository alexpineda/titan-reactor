import GrpSDLegacy from "../../atlas/grp-sd-legacy";
import { ImageDAT, CreepTexture } from "common/types";
import { NearestFilter } from "three";
// leverage our SD grp reader to render creep edges in SD
export const grpToCreepEdgesTextureAsync = async (
  creepGrp: Buffer,
  palette: Uint8Array
): Promise<CreepTexture> => {
  const stride = 37;
  const grpSD = new GrpSDLegacy();

  await grpSD.load(
    {
      readGrp: () => Promise.resolve(creepGrp),
      imageDef: {} as ImageDAT,
      palettes: [palette],
    },
    stride
  );

  grpSD.texture.minFilter = NearestFilter;
  grpSD.texture.magFilter = NearestFilter;

  return {
    texture: grpSD.texture,
    count: grpSD.width
  };
};
