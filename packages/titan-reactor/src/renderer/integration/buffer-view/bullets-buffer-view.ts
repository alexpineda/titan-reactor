import { Bullet } from "src/renderer/core/bullet";
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

    constructor(bw: OpenBWWasm) {
        super(bw);
        this._bulletTarget = new UnitsBufferView(bw);
        this._bulletOwnerUnit = new UnitsBufferView(bw);
    }

    override get index() {
        return this._bw.HEAP32[this._index32 + 28];
    }

    get bulletState() {
        return this._bw.HEAP32[this._index32 + 29];
    }

    get bulletTarget() {
        const addr = this._bw.HEAPU32[this._index32 + 30];
        if (addr === 0) return undefined;
        return this._bulletTarget.get(this._bw.HEAP32[addr >> 2]);
    }

    get bulletTargetPosX() {
        return this._bw.HEAP32[this._index32 + 31];
    }

    get bulletTargetPosY() {
        return this._bw.HEAP32[this._index32 + 32];
    }

    get weaponTypeId() {
        const addr = this._bw.HEAPU32[this._index32 + 33];
        return this._bw.HEAP32[addr >> 2];
    }

    get bulletOwnerUnit() {
        const addr = this._bw.HEAPU32[this._index32 + 38];
        if (addr === 0) return undefined;
        return this._bulletOwnerUnit.get(this._bw.HEAP32[addr >> 2]);
    }

    copy(bulletBufferView: BulletsBufferView) {
        return this.get(bulletBufferView.address);
    }

}
export default BulletsBufferView;
