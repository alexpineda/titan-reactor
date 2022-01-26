import { SpriteStruct } from "../data-transfer/sprite-struct";
import BufferView from "./buffer-view";

export class SpritesBufferView
  extends BufferView<SpriteStruct>
  implements SpriteStruct {

  static STRUCT_SIZE = 17;

  get index() {
    return this._read(0);
  }

  get typeId() {
    return this._read(1);
  }

  get titanIndex() {
    return 0;
  }

  get owner() {
    return this._read(2);
  }

  get elevation() {
    return this._read(3);
  }

  get flags() {
    return this._read(4);
  }

  get position() {
    return {
      x: this._read(5),
      y: this._read(6),
    }
  }

  get imageCount() {
    return this._read(7);
  }

  get images() {
    return [];
  }


  get mainImageIndex() {
    return this._read(8);
  }

  get order() {
    return 0;
  }

  get x() {
    return this.index;
  }

  get y() {
    return this.index;
  }

}
export default SpritesBufferView;
