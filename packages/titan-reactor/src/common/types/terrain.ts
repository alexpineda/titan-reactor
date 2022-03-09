import { Mesh, Texture, Vector3 } from "three";

import { GetTerrainY } from "./util";

// FIXME: deprecate? image has it?
export type WrappedTexture = {
  texture: Texture;
  width: number;
  height: number;
}

export type WrappedQuartileTextures = {
  mapQuartiles: Texture[][],
  quartileHeight: number,
  quartileStrideH: number,
  quartileStrideW: number,
  quartileWidth: number,
}

export type TerrainInfo = {
  tileset: number;
  mapWidth: number;
  mapHeight: number;
  terrain: Mesh;
  getTerrainY: GetTerrainY;
  creepTextureUniform: { value: Texture };
  creepEdgesTextureUniform: { value: Texture };
  minimapBitmap: ImageBitmap;
  getMapCoords: (x: number, y: number) => Vector3;
};

export type TilesetBuffers = {
  mapTiles: Uint16Array;
  megatiles: Uint32Array;
  minitilesFlags: Uint16Array;
  minitiles: Uint8Array;
  palette: Uint8Array;
  tileset: number;
  tilegroupU16: Uint16Array;
  tilegroupBuf: Buffer;
  hdTiles?: Buffer;
  creepGrpSD?: Buffer;
  creepGrpHD?: Buffer;
};
