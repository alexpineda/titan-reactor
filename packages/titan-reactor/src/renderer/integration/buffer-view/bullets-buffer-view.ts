import { OpenBWWasm } from "src/renderer/openbw";
import { BulletStruct } from "../structs/bullet-struct";
import FlingyBufferView from "./flingy-buffer-view";
import UnitsBufferView from "./units-buffer-view";

/**
 * Maps to openbw bullet_t
 */
export class BulletsBufferView extends FlingyBufferView
    implements BulletStruct {
    private _bulletTarget: UnitsBufferView;
    private _bulletOwnerUnit: UnitsBufferView;
    private _prevBounceUnit: UnitsBufferView;

    constructor(bw: OpenBWWasm) {
        super(bw);
        this._bulletTarget = new UnitsBufferView(bw);
        this._bulletOwnerUnit = new UnitsBufferView(bw);
        this._prevBounceUnit = new UnitsBufferView(bw);
    }

    override get index() {
        return this._bw.HEAP32[this._index32 + 28];
    }

    get state() {
        return this._bw.HEAP32[this._index32 + 29];
    }

    get targetUnit() {
        const addr = this._bw.HEAPU32[this._index32 + 30];
        if (addr === 0) return undefined;
        return this._bulletTarget.get(addr);
    }

    get targetPosX() {
        return this._bw.HEAP32[this._index32 + 31];
    }

    get targetPosY() {
        return this._bw.HEAP32[this._index32 + 32];
    }

    get weaponTypeId() {
        const addr = this._bw.HEAPU32[this._index32 + 33];
        return this._bw.HEAP32[addr >> 2];
    }

    get ownerUnit() {
        const addr = this._bw.HEAPU32[this._index32 + 38];
        if (addr === 0) return undefined;
        return this._bulletOwnerUnit.get(addr);
    }

    get prevBounceUnit() {
        const addr = this._bw.HEAPU32[this._index32 + 39];
        if (addr === 0) return undefined;
        return this._prevBounceUnit.get(addr);
    }

}
export default BulletsBufferView;
