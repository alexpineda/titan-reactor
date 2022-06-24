import type Chk from "bw-chk";
import { readCascFile } from "common/utils/casclib";
import { AssetTextureResolution, PxToGameUnit, TerrainInfo } from "common/types";

import {
  generateMapDataTextures, createTerrainMesh, generateMapDataBitmaps, defaultOptions, transformLevelConfiguration, createDisplacementImages, getTerrainY as genTerrainY
} from ".";

import { loadTilesetFiles } from "../../assets/load-tileset-files";
import settingsStore from "../../stores/settings-store";
import * as sd from "./sd";
import * as hd from "./hd";
import { Vector3 } from "three";
import * as log from "../../ipc";
import renderer from "../../render/renderer";

export default async function loadTerrain(chk: Chk, pxToMap: PxToGameUnit): Promise<TerrainInfo> {
  const settings = settingsStore().data;
  const geomOptions = defaultOptions;
  const [mapWidth, mapHeight] = chk.size;

  // files -> buffers
  const tilesetBuffers = await loadTilesetFiles(readCascFile, chk.tileset, chk._tiles, settings.assets.terrain);
  const bitmaps = await generateMapDataBitmaps(chk.size[0], chk.size[1], tilesetBuffers);

  // options -> data
  const dataTextures = await generateMapDataTextures({
    blendNonWalkableBase: geomOptions.blendNonWalkableBase,
    palette: tilesetBuffers.palette, mapWidth: chk.size[0], mapHeight: chk.size[1], mapData: bitmaps,
  }
  );
  const levels = transformLevelConfiguration(geomOptions.elevationLevels, geomOptions.normalizeLevels);

  //sd / hd textures required
  const { creepGrpSD, palette, hdTiles, creepGrpHD, tilegroupU16, tileset, megatiles, minitiles } = tilesetBuffers;

  const renderSD = settings.assets.terrain === AssetTextureResolution.SD;

  log.info(`Generating terrain ${settings.assets.terrain} textures`);

  const displacementImages = await createDisplacementImages({
    palette,
    tileset,
    mapWidth,
    mapHeight,
    dataTextures,
    geomOptions,
    levels,
  });

  const high = renderer.getWebGLRenderer().capabilities.getMaxAnisotropy();
  const anisotropies = {
    max: high,
    med: Math.floor(high / 2),
    low: 1
  };

  const anisotropy = anisotropies[settings.graphics.anisotropy as keyof typeof anisotropies];

  const creepTexture = renderSD ? sd.grpToCreepTexture(palette, megatiles, minitiles, tilegroupU16) : hd.ddsToCreepTexture(hdTiles, tilegroupU16, settings.assets.terrain);

  const creepEdgesTexture = renderSD ? await sd.grpToCreepEdgesTextureAsync(creepGrpSD, palette) : hd.ddsToCreepEdgesTexture(creepGrpHD, settings.assets.terrain);

  const textures = renderSD ? sd.createSdQuartiles(mapWidth, mapHeight, bitmaps.diffuse) : hd.createHdQuartiles(mapWidth, mapHeight,
    hdTiles,
    bitmaps.mapTilesData,
    settings.assets.terrain
  );

  const terrain = await createTerrainMesh(mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, dataTextures, displacementImages.displaceCanvas, textures, settings.graphics.terrainChunky, settings.graphics.terrainShadows, settings.util.debugMode);

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

  const minimapBitmap = await sd.createMinimapBitmap(bitmaps.diffuse, mapWidth, mapHeight);

  return {
    tileset: chk.tileset,
    getTerrainY,
    mapWidth,
    mapHeight,
    minimapBitmap,
    terrain,
    creepEdgesTextureUniform: dataTextures.creepEdgesTextureUniform,
    creepTextureUniform: dataTextures.creepTextureUniform,
    getMapCoords: (x, y) => {
      const mapX = pxToMap.x(x);
      const mapZ = pxToMap.y(y);
      const mapY = getTerrainY(mapX, mapZ);
      return new Vector3(mapX, mapY, mapZ);
    }
  }
}
