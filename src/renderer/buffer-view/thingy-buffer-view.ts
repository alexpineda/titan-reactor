import { OpenBW } from "common/types";
import { ThingyStruct } from "common/types/structs/thingy-struct";
import { FP8 } from "./fixed-point";
import { SpritesBufferView } from "./sprites-buffer-view";

/**
 * Maps to openbw thingy_t
 */
export class ThingyBufferView
    implements ThingyStruct {

    protected _address = 0;
    protected _sprite?: SpritesBufferView;

    #bwRef: WeakRef<OpenBW>;

    protected get _bw() {
        return this.#bwRef.deref()!;
    }

    get address() {
        return this._address;
    }

    get(address: number) {
        this._address = address;
        return this;
    }

    constructor(bw: OpenBW) {
        this.#bwRef = new WeakRef(bw);
        // this._sprite = new SpritesBufferView(bw);
    }

    protected get _addr8() {
        return this._address + (2 << 2); //skip link base
    }

    protected get _addr32() {
        return (this._address >> 2) + 2; //skip link base
    }

    get hp() {
        return FP8(this._bw.HEAPU32[this._addr32]);
    }

    get spriteIndex() {
        const spriteAddr = this._bw.HEAPU32[this._addr32 + 1];
        return this._bw.HEAPU32[(spriteAddr >> 2) + 2];
    }

    copyTo(dest: Partial<ThingyStruct>) {
        dest.hp = this.hp;
        dest.spriteIndex = this.spriteIndex;
    }
}