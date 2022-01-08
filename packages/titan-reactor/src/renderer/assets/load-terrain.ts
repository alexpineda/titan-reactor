import type Chk from "bw-chk";
import { readCascFile } from "../../common/utils/casclib";

import {
  createDataTextures, createHDMesh, createSDMesh, generateBitmaps, defaultOptions, transformLevelConfiguration, createDisplacementImages, GeometryOptions, MapBitmapsResult, getTerrainY as genTerrainY
} from "../../common/image/generate-map";

import { AssetTextureResolution, PxToGameUnit, TerrainInfo, TilesetBuffers } from "../../common/types";
import { loadTilesetFiles } from "./load-tileset-files";
import { getSettings } from "../stores/settings-store";
import * as sd from "../../common/image/generate-map/sd";
import * as hd from "../../common/image/generate-map/hd";

import { Mesh, Texture } from "three";
import assert from "assert";
import * as log from "../ipc";

export async function loadBuffersAndBitmaps(chk: Chk, terrainTextureResolution: AssetTextureResolution): Promise<{ tilesetBuffers: TilesetBuffers, bitmaps: MapBitmapsResult; }> {
  const tilesetBuffers = await loadTilesetFiles(readCascFile, chk.tileset, chk._tiles, terrainTextureResolution);
  const bitmaps = await generateBitmaps(chk.size[0], chk.size[1], tilesetBuffers);

  return {
    tilesetBuffers,
    bitmaps
  }
}

export async function loadDataTexturesAndLevels(chk: Chk, geomOptions: GeometryOptions, palette: Uint8Array, bitmaps: MapBitmapsResult) {
  const dataTextures = await createDataTextures({
    blendNonWalkableBase: geomOptions.blendNonWalkableBase,
    palette: palette, mapWidth: chk.size[0], mapHeight: chk.size[1], mapData: bitmaps,
  }
  );
  const levels = transformLevelConfiguration(geomOptions.elevationLevels, geomOptions.normalizeLevels);
  return { dataTextures, levels };
}

export default async function loadTerrain(chk: Chk, pxToMap: PxToGameUnit): Promise<TerrainInfo> {
  const settings = getSettings();
  const geomOptions = defaultOptions;
  const [mapWidth, mapHeight] = chk.size;

  // files -> buffers
  const { tilesetBuffers, bitmaps } = await loadBuffersAndBitmaps(chk, settings.assets.terrain);

  // options -> data
  const { dataTextures, levels } = await loadDataTexturesAndLevels(chk, geomOptions, tilesetBuffers.palette, bitmaps);

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

  let terrain = new Mesh();

  if (renderSD) {
    assert(creepGrpSD);
    const creepTexture = sd.grpToCreepTexture(palette, megatiles, minitiles, tilegroupU16);
    const creepEdgesTexture = await sd.grpToCreepEdgesTextureAsync(creepGrpSD, palette);
    terrain = await createSDMesh(tileset, mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, dataTextures, displacementImages.displaceCanvas);

  } else {
    assert(hdTiles);
    assert(creepGrpHD);

    const creepTexture = hd.ddsToCreepTexture(hdTiles, tilegroupU16);
    const creepEdgesTexture = hd.ddsToCreepEdgesTexture(creepGrpHD);
    const hdQuartileTextures = hd.mapDataToTextures(mapWidth, mapHeight,
      hdTiles,
      bitmaps.mapTilesData
    );
    terrain = await createHDMesh(tileset, mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, dataTextures, displacementImages.displaceCanvas, hdQuartileTextures);

  }

  const getTerrainY = genTerrainY(
    displacementImages.displacementImage,
    geomOptions.displacementScale,
    mapWidth,
    mapHeight
  );

  const minimapBitmap = await sd.createMinimapBitmap(bitmaps.diffuse, mapWidth, mapHeight);

  return {
    getTerrainY,
    mapWidth,
    mapHeight,
    minimapBitmap,
    terrain,
    creepEdgesTextureUniform: dataTextures.creepEdgesTextureUniform,
    creepTextureUniform: dataTextures.creepTextureUniform,
    getMapCoords: (x,y) => {
      const mapX = pxToMap.x(x);
      const mapZ = pxToMap.y(y);
      const mapY = getTerrainY(mapX, mapZ);
      return {
        x: mapX,
        y: mapY,
        z: mapZ
      }
    }
  }
}
