import { ChkType } from "../../common/types";
import { readCascFile } from "../../common/utils/casclib";

import {
  generateMaterialsAndMeshes,
  generateTextures,
} from "../../common/image/generate-map";
import { TerrainInfo } from "../../common/types";
import { loadTilesetFilesAsync } from "../../common/image/generate-map/map-data";

export async function generateTerrain(chk: ChkType): Promise<TerrainInfo> {
  // load all the tile files we need
  const tileFilesData = await loadTilesetFilesAsync(readCascFile, chk);

  // interpret them and create intermediate bitmaps and textures
  const mapData = await generateTextures(
    chk.size[0],
    chk.size[1],
    tileFilesData
  );

  // compile bitmaps and textures into shader programs, materials and meshes
  return await generateMaterialsAndMeshes(mapData);
}
