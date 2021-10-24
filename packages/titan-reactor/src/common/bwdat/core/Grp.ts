export type GrpFrameType = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type GrpType = {
  w: number;
  h: number;
  frames: GrpFrameType[];
  maxFrameH: number;
  maxFramew: number;
};
