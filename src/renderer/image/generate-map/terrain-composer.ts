import { GeometryOptions, UnitTileScale } from "common/types";

import {
  createLookupTextures, createTerrainGeometryFromQuartiles, createLookupBitmaps, defaultGeometryOptions, transformLevelConfiguration, doHeightMapEffect, LookupBitmaps
} from ".";

import { loadAllTilesetData, TilesetData } from "./get-tileset-buffers";

import * as sd from "./sd";
import * as hd from "./hd";
import { renderComposer } from "@render";
import { Creep } from "@core/creep/creep";
import { Janitor } from "three-janitor";
import processStore from "@stores/process-store";

export async function terrainComposer(mapWidth: number, mapHeight: number, tileset: number, mapTiles: Uint16Array, textureResolution: UnitTileScale, geomOptions: GeometryOptions = defaultGeometryOptions) {

  const janitor = new Janitor("chkToTerrainMesh");
  const genProcess = processStore().create("generate-textures", 4);

  const td = await loadAllTilesetData(tileset);

  const lookupBitmaps = await createLookupBitmaps(mapWidth, mapHeight, mapTiles, td);

  const lookupTextures = janitor.mop(await createLookupTextures(td, {
    blendNonWalkableBase: geomOptions.blendNonWalkableBase, mapWidth, mapHeight, lookupBitmaps,
  }));

  const levels = transformLevelConfiguration(geomOptions.elevationLevels, geomOptions.normalizeLevels);

  genProcess.increment();

  const renderer = renderComposer.getWebGLRenderer();

  const heightMaps = await doHeightMapEffect({
    palette: td.palette,
    tileset,
    mapWidth,
    mapHeight,
    lookupTextures,
    geomOptions,
    levels,
    renderer
  });

  genProcess.increment();

  renderComposer.preprocessStart();

  const { creepTexture, creepEdgesTexture } = janitor.mop(await generateCreepDiffuse(textureResolution, td));

  const { textures } = janitor.mop(generateMapDiffuseQuartiles(textureResolution, mapWidth, mapHeight, lookupBitmaps, td));

  //TODO: generate water mask

  renderComposer.preprocessEnd();
  genProcess.increment();


  const terrain = await createTerrainGeometryFromQuartiles(mapWidth, mapHeight, creepTexture, creepEdgesTexture, geomOptions, lookupTextures, heightMaps, textures);

  janitor.mop(terrain, "terrain");

  const creep = janitor.mop(new Creep(
    mapWidth,
    mapHeight,
    lookupTextures.creepTexUniform.value,
    lookupTextures.creepEdgesTexUniform.value
  ), "creep");

  return {
    terrain,
    minimapTex: lookupTextures.mapDiffuseTex,
    creep,
    heightMaps,
    dispose() {
      janitor.dispose();
    }
  }
}

const generateCreepDiffuse = async (textureResolution: UnitTileScale, td: TilesetData) => {

  const isLowRes = textureResolution === UnitTileScale.SD;

  renderComposer.preprocessStart();

  const creepTexture = isLowRes ? sd.grpToCreepTexture(td) : hd.ddsToCreepTexture(td.hdTiles, td.tilegroupsCV5, textureResolution, renderComposer.getWebGLRenderer());

  const creepEdgesTexture = isLowRes ? await sd.grpToCreepEdgesTextureAsync(td.creepGrpSD, td.palette) : hd.ddsToCreepEdgesTexture(td.creepGrpHD, textureResolution, renderComposer.getWebGLRenderer());

  return {
    creepTexture, creepEdgesTexture, dispose() {
      creepTexture.texture.dispose();
      creepEdgesTexture.texture.dispose();
    }
  }

}

const generateMapDiffuseQuartiles = (textureResolution: UnitTileScale, mapWidth: number, mapHeight: number, lookupBitmaps: LookupBitmaps, td: TilesetData) => {

  const isLowRes = textureResolution === UnitTileScale.SD;

  const textures = isLowRes ? sd.createSdQuartiles(mapWidth, mapHeight, lookupBitmaps.diffuse) : hd.createHdQuartiles(mapWidth, mapHeight,
    td.hdTiles,
    lookupBitmaps.mapTilesData,
    textureResolution, renderComposer.getWebGLRenderer()
  );

  return {
    textures,
    dispose() {
      textures.mapQuartiles.flat().forEach(t => t.dispose());
    }
  }
}

