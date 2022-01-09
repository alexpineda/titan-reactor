import { TileStruct } from "../data-transfer";
import BufferView from "./buffer-view";


// a block of fog of war data representing w x h map dimensions of fog of war information
export class TilesBufferView extends BufferView<TileStruct> implements TileStruct {
  static STRUCT_SIZE = 4;
  
  get explored() {
    return this._readU(0);
  }

  get visible() {
    return this._readU(1);
  }

  get flags() {
    return this._readU(2);
  }
}
export default TilesBufferView;
