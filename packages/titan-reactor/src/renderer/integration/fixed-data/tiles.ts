import { TileRAW } from "../tile-raw";
import BufferView from "./buffer-view";


// a block of fog of war data representing w x h map dimensions of fog of war information
export class TilesBW extends BufferView<TileRAW> implements TileRAW {
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
export default TilesBW;
