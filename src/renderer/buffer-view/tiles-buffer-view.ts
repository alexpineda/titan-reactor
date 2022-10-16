import { TileStruct } from "common/types/structs";
import { BufferView } from "./buffer-view";

export class TilesBufferView extends BufferView<TileStruct> implements TileStruct {
    static STRUCT_SIZE = 4;

    get explored() {
        return this._read( 0 );
    }

    get visible() {
        return this._read( 1 );
    }
}
