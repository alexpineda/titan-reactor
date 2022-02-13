import { OpenBWWasm } from "src/renderer/openbw";
import { ThingyStruct } from "../structs/thingy-struct";
import { FP8 } from "./fixed-point";
import SpritesBufferView from "./sprites-buffer-view";

/**
 * Maps to openbw unit_t starting from index address
 */
export class ThingyBufferView
    implements ThingyStruct {

    _address = 0;
    _bw: OpenBWWasm;
    _sprite: SpritesBufferView;

    get(address: number) {
        this._address = address;
        return this;
    }

    constructor(bw: OpenBWWasm) {
        this._bw = bw;
        this._sprite = new SpritesBufferView(bw);
    }


    protected get _index32() {
        return (this._address >> 2) + 2; //skip link base
    }

    get hp() {
        return FP8(this._bw.HEAPU32[this._index32]);
    }

    get owSprite() {
        const spriteAddr = this._bw.HEAPU32[this._index32 + 1];
        return this._sprite.get(spriteAddr);
    }

}
export default ThingyBufferView;
