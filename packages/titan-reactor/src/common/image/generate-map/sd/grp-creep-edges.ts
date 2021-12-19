import GrpSDLegacy from "../../atlas/atlas-sd-legacy";
import { ImageDATType } from "../../../types";
// leverage our SD grp reader to render creep edges in SD
export const grpToCreepEdgesTextureAsync = async (
  creepGrp: Buffer,
  palette: Uint8Array
) => {
  const stride = 37;
  const grpSD = new GrpSDLegacy();

  await grpSD.load(
    {
      readGrp: () => Promise.resolve(creepGrp),
      imageDef: {} as ImageDATType,
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
