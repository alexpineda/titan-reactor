import { WebGLRenderer } from "three";

import * as hd from "./hd";
import * as map from "./map-data";
import * as sd from "./sd";
import { TileSetData } from "./map-data";

export const generateTextures = async (
  mapWidth: number,
  mapHeight: number,
  {
    mapTiles,
    megatiles,
    minitilesFlags,
    minitiles,
    palette,
    tileset,
    hdTiles,
    tilegroupU16,
    tilegroupBuf,
    creepGrpHD,
    creepGrpSD,
  }: TileSetData
) => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const mapBitmaps = map.bitmaps(mapWidth, mapHeight, {
    mapTiles,
    palette,
    megatiles,
    minitilesFlags,
    minitiles,
    tilegroupU16,
  });

  const mapHd = hd.mapDataToTextures(renderer, mapWidth, mapHeight, {
    hdTiles,
    ...mapBitmaps,
  });

  const creepEdgesTextureHD = hd.ddsToCreepEdgesTexture(renderer, creepGrpHD);
  const creepTextureHD = hd.ddsToCreepTexture(renderer, hdTiles, tilegroupU16);

  const creepEdgesTextureSD = await sd.grpToCreepEdgesTextureAsync(
    creepGrpSD,
    palette
  );

  const creepTextureSD = sd.grpToCreepTexture(
    palette,
    megatiles,
    minitiles,
    tilegroupU16,
    renderer.capabilities.getMaxAnisotropy()
  );

  renderer.dispose();

  return {
    palette,
    tileset,
    mapWidth,
    mapHeight,
    mapData: mapBitmaps,
    mapHd,
    creepEdgesTextureSD,
    creepEdgesTextureHD,
    creepTextureHD,
    creepTextureSD,
  };
};
export default generateTextures;
