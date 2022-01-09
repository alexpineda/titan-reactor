export interface ImageStruct {
  index: number;
  titanIndex: number;
  typeId: number;
  flags: number;
  frameIndex: number;
  offset: {
    x: number;
    y: number;
  }
  modifier: number;
  modifierData1: number;
}
