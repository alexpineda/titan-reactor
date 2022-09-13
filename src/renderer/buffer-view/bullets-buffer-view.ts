import { OpenBW, BulletStruct } from "common/types";
import { FlingyBufferView } from "./flingy-buffer-view";

/**
 * Maps to openbw bullet_t
 */
export class BulletsBufferView extends FlingyBufferView
    implements BulletStruct {

    constructor(bw: OpenBW) {
        super(bw);

    }

    override get index() {
        return this._bw.HEAP32[this._addr32 + 28];
    }

    get state() {
        return this._bw.HEAP32[this._addr32 + 29];
    }

    get targetUnit() {
        const addr = this._bw.HEAPU32[this._addr32 + 30];
        if (addr === 0) return undefined;
        return addr;
    }

    get targetPosX() {
        return this._bw.HEAP32[this._addr32 + 31];
    }

    get targetPosY() {
        return this._bw.HEAP32[this._addr32 + 32];
    }

    get weaponTypeId() {
        const addr = this._bw.HEAPU32[this._addr32 + 33];
        return this._bw.HEAP32[addr >> 2];
    }

    get remainingTime() {
        return this._bw.HEAPU32[this._addr32 + 34];
    }

    get ownerUnit() {
        const addr = this._bw.HEAPU32[this._addr32 + 38];
        if (addr === 0) return undefined;
        return addr;
    }

    get prevBounceUnit() {
        const addr = this._bw.HEAPU32[this._addr32 + 39];
        if (addr === 0) return undefined;
        return addr;
    }

    /**
     * Our extensions determining start fly Y value and end fly Y value
     */
    get extSrcHOffset() {
        return this._bw.HEAPU32[this._addr32 + 41];
    }

    get extDstHOffset() {
        return this._bw.HEAPU32[this._addr32 + 42];
    }

}