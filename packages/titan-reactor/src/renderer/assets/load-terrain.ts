import type Chk from "bw-chk";
import { readCascFile } from "../../common/utils/casclib";

import {
  generateMapDataTextures, createHDMesh, createSDMesh, generateMapDataBitmaps, defaultOptions, transformLevelConfiguration, createDisplacementImages, GeometryOptions, MapBitmapsResult, getTerrainY as genTerrainY
} from "../../common/image/generate-map";

import { AssetTextureResolution, PxToGameUnit, TerrainInfo, TilesetBuffers } from "../../common/types";
import { loadTilesetFiles } from "./load-tileset-files";
import { getSettings } from "../stores/settings-store";
import * as sd from "../../common/image/generate-map/sd";
import * as hd from "../../common/image/generate-map/hd";
import { Layers } from "../render"
import { Mesh } from "three";
import assert from "assert";
import * as log from "../ipc";
import renderer from "../render/renderer";


export default async function loadTerrain(chk: Chk, pxToMap: PxToGameUnit): Promise<TerrainInfo> {
  const settings = getSettings();
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

  let terrain = new Mesh();

  const high = renderer.getWebGLRenderer().capabilities.getMaxAnisotropy();
  const anisotropies = {
    max: high,
    med: Math.floor(high / 2),
    low: 1
  };

  const anisotropy = anisotropies[settings.graphics.anisotropy as keyof typeof anisotropies];

  if (renderSD) {
    assert(creepGrpSD);
    const creepTexture = sd.grpToCreepTexture(palette, megatiles, minitiles, tilegroupU16);
    const creepEdgesTexture = await sd.grpToCreepEdgesTextureAsync(creepGrpSD, palette);
    terrain = await createSDMesh(tileset, mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, dataTextures, displacementImages.displaceCanvas);

    creepTexture.texture.anisotropy = anisotropy;
    creepEdgesTexture.texture.anisotropy = anisotropy;
    dataTextures.sdMap.anisotropy = anisotropy;
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

    creepTexture.texture.anisotropy = anisotropy;
    creepEdgesTexture.texture.anisotropy = anisotropy;
    for (const row of hdQuartileTextures.mapQuartiles) {
      for (const texture of row) {
        texture.anisotropy = anisotropy;
      }
    }
  }

  terrain.layers.enable(Layers.Clickable);

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
    getMapCoords: (x, y) => {
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
