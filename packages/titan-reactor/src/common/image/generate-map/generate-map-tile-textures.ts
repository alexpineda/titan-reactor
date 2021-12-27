import { Texture, WebGLRenderer } from "three";

import * as hd from "./hd";
import * as map from "./map-data";
import * as sd from "./sd";
import { AssetTextureResolution, Settings, TileSetData } from "../../types";
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

//@todo
// waterMasks,
// waterMasksDds,
// waterNormal1,
// waterNormal2,
// noise,
export type AssetTexturesResult = {
  palette: Uint8Array;
  tileset: number,
  mapWidth: number,
  mapHeight: number,
  mapData: MapBitmapsResult,
  hdQuartileTextures?: QuartiledTextures,
  creepEdgesTexture: TextureResult,
  creepTexture: TextureResult,
}

export const generateMapTileTextures = async (
  mapWidth: number,
  mapHeight: number,
  tilesetData: TileSetData,
  settings: Settings
): Promise<AssetTexturesResult> => {

  const {
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
  } = tilesetData;


  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const mapData = map.bitmaps(mapWidth, mapHeight, {
    mapTiles,
    palette,
    megatiles,
    minitilesFlags,
    minitiles,
    tilegroupU16,
  });

  const renderSD = settings.terrainTextureResolution === AssetTextureResolution.SD;

  const hdQuartileTextures = renderSD ? undefined : hd.mapDataToTextures(renderer, mapWidth, mapHeight, {
    hdTiles,
    mapTilesData: mapData.mapTilesData
  });

  const creepEdgesTexture = renderSD ? await sd.grpToCreepEdgesTextureAsync(
    creepGrpSD,
    palette
  ) : hd.ddsToCreepEdgesTexture(renderer, creepGrpHD)

  const creepTexture = renderSD ? sd.grpToCreepTexture(
    palette,
    megatiles,
    minitiles,
    tilegroupU16,
    settings.anisotropy
  ) : hd.ddsToCreepTexture(renderer, hdTiles, tilegroupU16);

  renderer.dispose();

  return {
    palette,
    tileset,
    mapWidth,
    mapHeight,
    mapData: mapData,
    hdQuartileTextures,
    creepEdgesTexture,
    creepTexture
  };
};
export default generateMapTileTextures;
