import { OpenBWWasm } from "common/types";
import { ThingyStruct } from "common/types/structs/thingy-struct";
import { FP8 } from "./fixed-point";
import { SpritesBufferView } from "./sprites-buffer-view";

/**
 * Maps to openbw thingy_t
 */
export class ThingyBufferView
    implements ThingyStruct {

    protected _address = 0;
    protected _bw: OpenBWWasm;
    protected _sprite: SpritesBufferView;

    get address() {
        return this._address;
    }

    get(address: number) {
        this._address = address;
        return this;
    }

    constructor(bw: OpenBWWasm) {
        this._bw = bw;
        this._sprite = new SpritesBufferView(bw);
    }


    protected get _addr32() {
        return (this._address >> 2) + 2; //skip link base
    }

    get hp() {
        return FP8(this._bw.HEAPU32[this._addr32]);
    }

    get owSprite() {
        const spriteAddr = this._bw.HEAPU32[this._addr32 + 1];
        return this._sprite.get(spriteAddr);
    }

    get spriteIndex() {
        return this.owSprite.index;
    }

    copyTo(dest: Partial<ThingyStruct>) {
        dest.hp = this.hp;
        dest.spriteIndex = this.spriteIndex;
    }
}
export default ThingyBufferView;
