import { OpenBW } from "common/types";
import { ThingyStruct } from "common/types/structs/thingy-struct";
import { FP8 } from "./fixed-point";
import { SpritesBufferView } from "./sprites-buffer-view";

/**
 * Maps to openbw thingy_t
 */
export class ThingyBufferView implements ThingyStruct {
    protected _address = 0;
    protected _addr32 = 0;
    protected _addr8 = 0;
    protected _sprite?: SpritesBufferView;

    _bw: OpenBW;

    get address() {
        return this._address;
    }

    get( address: number ) {
        this._address = address;
        this._addr32 = ( address >> 2 ) + 2; //skip link base
        this._addr8 = address + ( 2 << 2 ); //skip link base

        return this;
    }

    constructor( bw: OpenBW ) {
        this._bw = bw;
    }

    get hp() {
        return FP8( this._bw.HEAPU32[this._addr32] );
    }

    get spriteIndex() {
        const spriteAddr = this._bw.HEAPU32[this._addr32 + 1];
        return this._bw.HEAPU32[( spriteAddr >> 2 ) + 2];
    }

    copyTo( dest: Partial<ThingyStruct> ) {
        dest.hp = this.hp;
        dest.spriteIndex = this.spriteIndex;
    }
}
