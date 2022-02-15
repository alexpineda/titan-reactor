import { FlingyStruct } from "../structs/flingy-struct";
import ThingyBufferView from "./thingy-buffer-view";

/**
 * Maps to openbw flingy_t
 */
export class FlingyBufferView extends ThingyBufferView
    implements FlingyStruct {

    get index() {
        return this._bw.HEAPU32[this._index32 + 2];
    }

    // target = 3
    // movement waypoint = 2
    // target waypoint= 2
    // movement flags = 1

    get direction() {
        const heading = this._bw.HEAP32[this._index32 + 10];
        // auto v = dir.fractional_part();
        // if (v < 0) return 256 + v;
        // else return v;

        // raw_type fractional_part() const {
        //     return raw_value & (((raw_type)1 << fractional_bits) - 1);
        // }
        return 0;
    }

    get x() {
        return this._bw.HEAP32[this._index32 + 16];
    }

    get y() {
        return this._bw.HEAP32[this._index32 + 17];
    }

    override copyTo(dest: FlingyStruct) {
        super.copyTo(dest);
        dest.direction = this.direction;
        dest.x = this.x;
        dest.y = this.y;
    }
}
export default FlingyBufferView;
