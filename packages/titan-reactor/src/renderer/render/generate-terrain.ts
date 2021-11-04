import Chk from "libs/bw-chk";
import { openCasclibFile } from "../ipc";

import {
  generateMaterialsAndMeshes,
  generateTextures,
} from "../../common/image/generate-map";
import { loadTilesetFilesAsync } from "../../common/image/generate-map/map-data";

export async function generateTerrain(chk: Chk) {
  // load all the tile files we need
  const tileFilesData = await loadTilesetFilesAsync(openCasclibFile, chk);

  // interpret them and create intermediate bitmaps and textures
  const mapData = await generateTextures(
    chk.size[0],
    chk.size[1],
    tileFilesData
  );

  // compile bitmaps and textures into shader programs, materials and meshes
  return await generateMaterialsAndMeshes(mapData);
}
