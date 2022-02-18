
export type CanvasDimensions = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type GameCanvasDimensions = CanvasDimensions & {
  minimap: {
    width: number;
    height: number;
  }
};
