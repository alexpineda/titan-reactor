import { SoundStruct } from "../structs";
import BufferView from "./buffer-view";

export class SoundsBufferView
  extends BufferView<SoundStruct>
  implements SoundStruct {
  static STRUCT_SIZE = 16;

  get typeId() {
    return this._read(0);
  }

  get x() {
    return this._read(1);
  }

  get y() {
    return this._read(2);
  }

  get unitTypeId() {
    const val = this._read(3);
    return val === -1 ? null : val;
  }


  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

  override object(): SoundStruct {
    return {
      typeId: this.typeId,
      unitTypeId: this.unitTypeId as number,
      x: this.x,
      y: this.y,
    };
  }

}
export default SoundsBufferView;
