import { WebGLRenderer } from "three";

import * as MapData from "./map-data";
import * as HD from "./hd";
import * as SD from "./sd";

export default async (
  mapWidth,
  mapHeight,
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
  }
) => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const mapBitmaps = MapData.bitmaps(mapWidth, mapHeight, {
    mapTiles,
    palette,
    megatiles,
    minitilesFlags,
    minitiles,
    tilegroupU16,
    tilegroupBuf,
  });

  const mapHd = HD.mapDataToTextures(renderer, mapWidth, mapHeight, {
    hdTiles,
    ...mapBitmaps,
  });

  const creepEdgesTextureHD = HD.ddsToCreepEdgesTexture(renderer, creepGrpHD);
  const creepTextureHD = HD.ddsToCreepTexture(renderer, hdTiles, tilegroupU16);

  const creepEdgesTextureSD = await SD.grpToCreepEdgesTextureAsync(
    creepGrpSD,
    palette
  );

  const creepTextureSD = SD.grpToCreepTexture(
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
