
export type CanvasDimensions = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type MinimapDimensions = {
  minimapWidth: number;
  minimapHeight: number;
}

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}