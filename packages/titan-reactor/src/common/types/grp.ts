import { Texture } from "three";

export type GrpFrameType = {
  x: number;
  y: number;
  w: number;
  h: number;
  xoff: number;
  yoff: number;
};

export type GrpType = {
  w: number;
  h: number;
  frames: GrpFrameType[];
  maxFrameH: number;
  maxFramew: number;
};

export type GRPInterface = {
  width: number;
  height: number;
  grpWidth?: number;
  grpHeight?: number;
  imageIndex: number;
  frames?: GrpFrameType[];
  diffuse?: Texture;
  teamcolor?: Texture;
};

export type AnimTextureType = {
  ddsOffset: number;
  size: number;
  width: number;
  height: number;
};

export type AnimSprite = {
  refId?: number;
  w: number;
  h: number;
  maps: Record<string, AnimTextureType>;
  frames: GrpFrameType[];
};

export type DDSGrpFrameType = {
  i: number;
  w: number;
  h: number;
  size: number;
  dds: Buffer;
};
