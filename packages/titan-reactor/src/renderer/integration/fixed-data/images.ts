import { ImageStruct } from "../data-transfer/image-struct";
import BufferView from "./buffer-view";

export class ImagesBW
  extends BufferView<ImageStruct>
  implements ImageStruct {

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


  get index() {
    return this._read(6);
  }

  get typeId() {
    return this._read(7);
  }

  get titanIndex() {
    return 0
  }

  get frameIndex() {
    return this._read(8);
  }

  get x() {
    return this._read(8);
  }

  get y() {
    return this._read(8);
  }

  get order() {
    return this._read(8);
  }


}
export default ImagesBW;
