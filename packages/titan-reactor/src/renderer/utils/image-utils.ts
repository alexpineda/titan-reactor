import { BwDAT } from "../../common/types";
import { ImageFlags, drawFunctions } from "../../common/bwdat/enums";
import { ImageStruct } from "../integration/data-transfer";

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
    return image.flags & ImageFlags.Hidden;
}

export const isFrozen = (image: ImageStruct) => {
    return image.flags & ImageFlags.Frozen;
}