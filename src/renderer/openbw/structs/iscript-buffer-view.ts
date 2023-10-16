import { OpenBW } from "@openbw/openbw";
import { IScriptStateStruct } from "common/types/structs/iscript-struct";

export class IScriptBufferView implements IScriptStateStruct {
    #address = 0;
    _bw: OpenBW;
    _debug = 0;

    get( address: number ) {
        this.#address = address;
        return this;
    }

    constructor( bw: OpenBW ) {
        this._bw = bw;
    }

    private get _index32() {
        return this.#address >> 2;
    }

    get programAddress() {
        const addr = this._bw.HEAPU32[this._index32];
        if ( addr === 0 ) {
            return null;
        }
        return addr >> 2;
    }

    get typeId() {
        // iscript program address
        if ( this.programAddress === null ) {
            return null;
        }
        return this._bw.HEAPU32[this.programAddress];
    }

    get programCounter() {
        return this._bw.HEAPU32[this._index32 + 1];
    }

    //FIXME: this is completely wrong and not working
    get opCounter() {
        const p =
            this._bw.HEAPU32[
                ( this._bw.getIScriptProgramDataAddress() + this.programCounter ) >> 2
            ];
        const opc = p - 0x808091;
        return opc;
    }

    get returnAddress() {
        return this._bw.HEAP32[this._index32 + 2];
    }

    get animation() {
        return this._bw.HEAP32[this._index32 + 3];
    }

    get wait() {
        return this._bw.HEAP32[this._index32 + 4];
    }
}
