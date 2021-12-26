import { DDSGrpFrameType } from "./";
import { Mesh, Texture } from "three";

import { GetTerrainY } from "./util";

export type TerrainInfo = {
  mapWidth: number;
  mapHeight: number;
  terrain: Mesh;
  getTerrainY: GetTerrainY;
  creepTextureUniform: { value: Texture };
  creepEdgesTextureUniform: { value: Texture };
  minimapBitmap: ImageBitmap;
};


export type TileSetData = {
  mapTiles: Uint16Array;
  megatiles: Uint32Array;
  minitilesFlags: Uint16Array;
  minitiles: Uint8Array;
  palette: Uint8Array;
  tileset: number;
  hdTiles: Buffer[];
  tilegroupU16: Uint16Array;
  tilegroupBuf: Buffer;
  creepGrpSD: Buffer;
  creepGrpHD: DDSGrpFrameType[];
};
