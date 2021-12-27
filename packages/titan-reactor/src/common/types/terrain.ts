import { DDSGrpFrameType } from "./";
import { Mesh, Texture } from "three";

import { GetTerrainY } from "./util";

// @todo deprecate? image has it?
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
  mapWidth: number;
  mapHeight: number;
  terrain: Mesh;
  getTerrainY: GetTerrainY;
  creepTextureUniform: { value: Texture };
  creepEdgesTextureUniform: { value: Texture };
  minimapBitmap: ImageBitmap;
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
