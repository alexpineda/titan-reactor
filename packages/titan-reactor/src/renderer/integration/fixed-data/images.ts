import { drawFunctions } from "../../../common/bwdat/enums";
import { BwDAT } from "../../../common/types/bwdat";
import { ImageRAW } from "../image-raw";
import BufferView from "./buffer-view";

const flags = Object.freeze({
  redraw: 1,
  flipped: 2,
  frozen: 4,
  directional: 8,
  iscript: 0x10,
  clickable: 0x20,
  hidden: 0x40,
  specialOffset: 0x80,
});


// get isShadow() {
//   return (
//     (this.bwDat as BwDAT).images[this.id].drawFunction ===
//     drawFunctions.rleShadow
//   );
// }

// get dat() {
//   return (this.bwDat as BwDAT).images[this.id];
// }

export class ImagesBW
  extends BufferView<ImageRAW>
  implements ImageRAW
{
  
  get flags() {
    return this._read(0);
  }

  //@todo change this to byte?
  get modifier() {
    return this._read(1);
  }

  //@todo change this to byte?
  get modifierData1() {
    return this._read(2);
  }


  get containerIndex() {
    return this._read(6);
  }

  get id() {
    return this._read(7);
  }

  get frameIndex() {
    return this._read(8);
  }

  get x() {
    return this._read(9);
  }

  get y() {
    return this._read(10);
  }

  get flipped() {
    return (this.flags & flags.flipped) != 0;
  }

  get hidden() {
    return (this.flags & flags.hidden) != 0;
  }

  get frozen() {
    return (this.flags & flags.frozen) != 0;
  }

}
export default ImagesBW;
