

import { DDS } from "@image/formats/parse-dds";
import { BufferGeometry, CompressedTexture, Mesh, MeshBasicMaterial, MeshStandardMaterial, Texture } from "three";

export type GeometryOptions = {
  /** 
   * low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
   */
  elevationLevels: number[];
  ignoreLevels: number[];
  normalizeLevels: boolean;
  textureDetail: number;
  /**
   * number of vertices per tile
   */
  meshDetail: number;
  blendNonWalkableBase: boolean;
  firstPass: boolean;
  secondPass: boolean;
  processWater: boolean;
  maxTerrainHeight: number;
  drawMode: { value: number };
  detailsMix: number;
  bumpScale: number;
  firstBlur: number;
}

export type CreepTexture = {
  texture: Texture;
  count: number;
}

export type WrappedQuartileTextures = {
  mapQuartiles: Texture[][],
  quartileHeight: number,
  quartileWidth: number,
}

export interface TerrainQuartile extends Mesh<BufferGeometry, MeshStandardMaterial | MeshBasicMaterial> {
  userData: {
    qx: number;
    qy: number;
    basicMaterial: MeshBasicMaterial;
    standardMaterial: MeshStandardMaterial;
  }
}

export type EffectsTextures = {
  waterNormal1: CompressedTexture[],
  waterNormal2: CompressedTexture[],
  noise: DDS,
  waterMask: CompressedTexture[] | null,
  tileMask: { i: number, vr4id: number, maskid: number }[] | null,
}