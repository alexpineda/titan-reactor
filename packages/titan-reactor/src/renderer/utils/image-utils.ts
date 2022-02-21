import { BwDAT } from "../../common/types";
import { ImageFlags, drawFunctions } from "../../common/enums";
import { ImageStruct } from "../integration/structs";

export const isShadow = (image: ImageStruct, bwDat: BwDAT) => {
  return (
    bwDat.images[image.typeId].drawFunction ===
    drawFunctions.rleShadow
  );
}

export const isFlipped = (image: ImageStruct) => {
  return (image.flags & ImageFlags.Flipped) !== 0;
}

export const isHidden = (image: ImageStruct) => {
  return (image.flags & ImageFlags.Hidden) !== 0;
}

export const isFrozen = (image: ImageStruct) => {
  return image.flags & ImageFlags.Frozen;
}

export const redraw = (image: ImageStruct) => {
  return !!(image.flags & ImageFlags.Redraw);
}

export const hasDirectionalFrames = (image: ImageStruct) => {
  return image.flags & ImageFlags.Directional;
}

export const isClickable = (image: ImageStruct) => {
  return image.flags & ImageFlags.Clickable;
}