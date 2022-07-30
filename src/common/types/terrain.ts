

import { BufferGeometry, Group, Mesh, MeshStandardMaterial, Texture } from "three";
import { GetTerrainY } from "./util";


export type GeometryOptions = {
  /** 
   * low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
   */
  elevationLevels: number[];
  ignoreLevels: number[];
  normalizeLevels: boolean;
  displaceDimensionScale: number;
  /**
   * number of vertices per tile
   */
  displaceVertexScale: number;
  blendNonWalkableBase: boolean;
  firstPass: boolean;
  secondPass: boolean;
  processWater: boolean;
  displacementScale: number;
  drawMode: { value: number };
  detailsMix: number;
  bumpScale: number;
  firstBlur: number;
}

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

export class TerrainQuartile extends Mesh<BufferGeometry, MeshStandardMaterial> {
  override userData = {
    qx: 0,
    qy: 0
  }
}

export class Terrain extends Group {
  override children: TerrainQuartile[] = [];
  override userData: {
    quartileWidth: number,
    quartileHeight: number,
    tilesX: number,
    tilesY: number,
    geomOptions?: GeometryOptions
  } = {
      quartileWidth: 0,
      quartileHeight: 0,
      tilesX: 0,
      tilesY: 0,
    }
}

export type TerrainInfo = {
  tileset: number;
  mapWidth: number;
  mapHeight: number;
  mesh: Terrain;
  shadowsEnabled: boolean;
  /**
   * Gets the y offset at the given x,z coordinates.
   */
  getTerrainY: GetTerrainY;
  creepTextureUniform: { value: Texture };
  creepEdgesTextureUniform: { value: Texture };
  minimapBitmap: ImageBitmap;
  anisotropy: string;
  geomOptions: GeometryOptions;
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
