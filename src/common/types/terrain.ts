import { Object3D, Texture } from "three";
import { GetTerrainY } from "./util";

// FIXME: deprecate? image has it?
export type WrappedTexture = {
  texture: Texture;
  width: number;
  height: number;
  pxPerTile: 32 | 64 | 128;
}

export type WrappedQuartileTextures = {
  mapQuartiles: Texture[][],
  quartileHeight: number,
  quartileWidth: number,
}

export type TerrainInfo = {
  tileset: number;
  mapWidth: number;
  mapHeight: number;
  terrain: Object3D;
  /**
   * Gets the y offset at the given x,z coordinates.
   */
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
  hdTiles: Buffer;
  creepGrpSD: Buffer;
  creepGrpHD: Buffer;
};
