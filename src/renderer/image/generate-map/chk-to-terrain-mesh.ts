import type Chk from "bw-chk";
import { AssetTextureResolution, TerrainInfo } from "common/types";
import {
  createDataTextures, createTerrainGeometryFromQuartiles, extractBitmaps, defaultOptions, transformLevelConfiguration, dataTexturesToHeightMaps, getTerrainY as genTerrainY
} from ".";

import * as log from "@ipc";
import { getTilesetBuffers } from "./get-tileset-buffers";

import * as sd from "./sd";
import * as hd from "./hd";
import { anisotropyOptions } from "@utils/renderer-utils";

type TerrainMeshSettings = {
  textureResolution: AssetTextureResolution;
  anisotropy: string;
}

export default async function chkToTerrainMesh(chk: Chk, settings: TerrainMeshSettings): Promise<TerrainInfo> {
  const geomOptions = defaultOptions;
  const [mapWidth, mapHeight] = chk.size;

  const tilesetBuffers = await getTilesetBuffers(chk.tileset, chk._tiles, settings.textureResolution);
  const bitmaps = await extractBitmaps(chk.size[0], chk.size[1], tilesetBuffers);
  const dataTextures = await createDataTextures({
    blendNonWalkableBase: geomOptions.blendNonWalkableBase,
    palette: tilesetBuffers.palette, mapWidth: chk.size[0], mapHeight: chk.size[1], mapData: bitmaps,
  }
  );


  const levels = transformLevelConfiguration(geomOptions.elevationLevels, geomOptions.normalizeLevels);

  const { creepGrpSD, palette, hdTiles, creepGrpHD, tilegroupU16, tileset, megatiles, minitiles } = tilesetBuffers;

  log.verbose(`Generating terrain ${settings.textureResolution} textures`);

  const displacementImages = await dataTexturesToHeightMaps({
    palette,
    tileset,
    mapWidth,
    mapHeight,
    dataTextures,
    geomOptions,
    levels,
  });

  const isLowRes = settings.textureResolution === AssetTextureResolution.SD;

  const creepTexture = isLowRes ? sd.grpToCreepTexture(palette, megatiles, minitiles, tilegroupU16) : hd.ddsToCreepTexture(hdTiles, tilegroupU16, settings.textureResolution);

  const creepEdgesTexture = isLowRes ? await sd.grpToCreepEdgesTextureAsync(creepGrpSD, palette) : hd.ddsToCreepEdgesTexture(creepGrpHD, settings.textureResolution);

  const textures = isLowRes ? sd.createSdQuartiles(mapWidth, mapHeight, bitmaps.diffuse) : hd.createHdQuartiles(mapWidth, mapHeight,
    hdTiles,
    bitmaps.mapTilesData,
    settings.textureResolution
  );

  const terrain = await createTerrainGeometryFromQuartiles(mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, dataTextures, displacementImages.displaceCanvas, textures);

  const minimapBitmap = await sd.createMinimapBitmap(bitmaps.diffuse, mapWidth, mapHeight);


  const anisotropy = anisotropyOptions[settings.anisotropy as keyof typeof anisotropyOptions];
  creepTexture.texture.anisotropy = anisotropy;
  creepEdgesTexture.texture.anisotropy = anisotropy;

  for (const row of textures.mapQuartiles) {
    for (const texture of row) {
      texture.anisotropy = anisotropy;
    }
  }

  const getTerrainY = genTerrainY(
    displacementImages.displacementImage,
    geomOptions.displacementScale,
    mapWidth,
    mapHeight
  );

  return {
    tileset: chk.tileset,
    getTerrainY,
    mapWidth,
    mapHeight,
    minimapBitmap,
    terrain,
    creepEdgesTextureUniform: dataTextures.creepEdgesTextureUniform,
    creepTextureUniform: dataTextures.creepTextureUniform
  }
}
