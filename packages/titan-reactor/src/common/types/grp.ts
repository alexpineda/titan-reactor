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

export type AnimDds = {
  ddsOffset: number;
  size: number;
  width: number;
  height: number;
};

export type AnimSprite = {
  w: number;
  h: number;
  maps: Record<string, AnimDds>;
  frames: GrpFrameType[];
};

export type AnimSpriteRef = {
  refId: number;
};

export type DDSGrpFrameType = {
  i: number;
  w: number;
  h: number;
  size: number;
  dds: Buffer;
};
