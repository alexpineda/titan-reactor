import { AnimationClip, CompressedTexture, Group, Texture } from "three";

export type AnimFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
  xoff: number;
  yoff: number;
};

export type GrpSprite = {
  w: number;
  h: number;
  frames: AnimFrame[];
  maxFrameH: number;
  maxFramew: number;
};

type HDLayers = {
  brightness?: CompressedTexture | undefined;
  normal?: CompressedTexture | undefined;
  specular?: CompressedTexture | undefined;
  aoDepth?: CompressedTexture | undefined;
  emissive?: CompressedTexture | undefined;
}

export type Atlas = {
  type: "anim";
  textureWidth: number;
  textureHeight: number;
  spriteWidth: number;
  spriteHeight: number;
  imageIndex: number;
  frames: AnimFrame[];
  diffuse: Texture;
  teammask?: Texture;
  unitTileScale: number;
  grp: GrpSprite;

  hdLayers?: HDLayers;
  mipmap?: HDLayers;
};

export type GlbAtlas = Atlas & {
  model: Group | undefined;
  animations: AnimationClip[];
  fixedFrames: number[];
}

export type AnimDds = {
  ddsOffset: number;
  size: number;
  width: number;
  height: number;
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
