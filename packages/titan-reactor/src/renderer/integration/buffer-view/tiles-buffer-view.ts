import { TileStruct } from "../structs";
import BufferView from "./buffer-view";

export class TilesBufferView extends BufferView<TileStruct> implements TileStruct {
  static STRUCT_SIZE = 4;

  get explored() {
    return this._read(0);
  }

  get visible() {
    return this._read(1);
  }

  get flags() {
    throw new Error("flags is uint16, you are likely looking for creep data, read via copy() or shallowCopy()");
  }
}
export default TilesBufferView;
