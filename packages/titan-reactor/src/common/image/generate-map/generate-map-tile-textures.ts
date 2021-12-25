import { Texture, WebGLRenderer } from "three";

import * as hd from "./hd";
import * as map from "./map-data";
import * as sd from "./sd";
import { TileSetData } from "../../types";
import { MapBitmapsResult } from "./map-data";

export type QuartiledTextures = {
  mapQuartiles: Texture[][],
  quartileHeight: number,
  quartileStrideH: number,
  quartileStrideW: number,
  quartileWidth: number,
}

export type TextureResult = {
  width: number,
  height: number,
  texture: Texture
}

export type GenerateTexturesResult = {
  palette: Uint8Array;
  tileset: number,
  mapWidth: number,
  mapHeight: number,
  mapData: MapBitmapsResult,
  mapHd: QuartiledTextures,
  creepEdgesTextureSD: TextureResult,
  creepEdgesTextureHD: TextureResult,
  creepTextureHD: TextureResult,
  creepTextureSD: TextureResult,
}

export const generateMapTileTextures = async (
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
    creepGrpHD,
    creepGrpSD,
  }: TileSetData
): Promise<GenerateTexturesResult> => {
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
export default generateMapTileTextures;
