import { FlingyStruct } from "common/types";
import { ThingyBufferView } from "./thingy-buffer-view";
import { FP8 } from "./fixed-point";

function fractional_part( raw_value: number, fractional_bits: number ) {
    return raw_value & ( ( 1 << fractional_bits ) - 1 );
}

export class FlingyBufferView extends ThingyBufferView implements FlingyStruct {
    get index() {
        return this._bw.HEAPU32[this._addr32 + 2];
    }

    get moveTargetX() {
        return this._bw.HEAPU32[this._addr32 + 3];
    }

    get moveTargetY() {
        return this._bw.HEAPU32[this._addr32 + 4];
    }

    get nextMovementWaypointX() {
        return this._bw.HEAPU32[this._addr32 + 6];
    }

    get nextMovementWaypointY() {
        return this._bw.HEAPU32[this._addr32 + 7];
    }

    get nextTargetWaypointX() {
        return this._bw.HEAPU32[this._addr32 + 8];
    }

    get nextTargetWaypointY() {
        return this._bw.HEAPU32[this._addr32 + 9];
    }

    get movementFlags() {
        return this._bw.HEAPU32[this._addr32 + 10];
    }

    get direction() {
        // heading is a large structure (fixed_point), get the byte at 2nd word for raw value
        const heading = this._bw.HEAP8[this._addr8 + ( 11 << 2 )];
        const v = fractional_part( heading, 8 );
        if ( v < 0 ) return 256 + v;
        else return v;
    }

    get x() {
        return this._bw.HEAP32[this._addr32 + 16];
    }

    get y() {
        return this._bw.HEAP32[this._addr32 + 17];
    }

    //xy_fp8 exact_position;
    // fp8 flingy_top_speed;
    // fp8 current_speed;

    get currentSpeed() {
        return FP8(this._bw.HEAPU32[this._addr32 + 21]);
    }

}
