import { Mesh, Texture } from "three";

import { GetTerrainY } from "./util";

export type TerrainInfo = {
  mapWidth: number;
  mapHeight: number;
  terrain: Mesh;
  sdTerrain: Mesh;
  getTerrainY: GetTerrainY;
  creepTextureUniform: { value: Texture };
  creepEdgesTextureUniform: { value: Texture };
  minimapBitmap: ImageBitmap;
};
