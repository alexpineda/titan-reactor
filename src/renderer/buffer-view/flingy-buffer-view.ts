import { FlingyStruct } from "common/types";
import ThingyBufferView from "./thingy-buffer-view";

function fractional_part(raw_value: number, fractional_bits: number) {
    return raw_value & ((1 << fractional_bits) - 1);
}

/**
 * Maps to openbw flingy_t
 */
export class FlingyBufferView extends ThingyBufferView
    implements FlingyStruct {

    get index() {
        return this._bw.HEAPU32[this._addr32 + 2];
    }

    // target = 3
    // movement waypoint = 2
    // target waypoint= 2
    // movement flags = 1

    get direction() {
        // heading is a large structure (fixed_point), get the byte at 2nd word for raw value
        const heading = this._bw.HEAP8[this._addr8 + (11 << 2)];
        const v = fractional_part(heading, 8);
        if (v < 0) return 256 + v;
        else return v;
    }

    get x() {
        return this._bw.HEAP32[this._addr32 + 16];
    }

    get y() {
        return this._bw.HEAP32[this._addr32 + 17];
    }

    override copyTo(dest: Partial<FlingyStruct>) {
        super.copyTo(dest);
        dest.direction = this.direction;
        dest.x = this.x;
        dest.y = this.y;
    }
}
export default FlingyBufferView;
