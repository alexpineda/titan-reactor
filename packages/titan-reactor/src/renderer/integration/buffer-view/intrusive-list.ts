import { OpenBWWasm } from "src/renderer/openbw";

/**
 * Represents an openbw intrusive_list
 */
export class IntrusiveList {
    private _bw: OpenBWWasm;
    private _pairOffset: number;
    private _current = 0;
    addr: number;

    constructor(bw: OpenBWWasm, addr = 0, pairOffset = 0) {
        this._bw = bw;
        this.addr = addr;
        this._pairOffset = pairOffset;
    }

    *[Symbol.iterator]() {
        const end = this._bw.HEAPU32[(this.addr >> 2)];
        const begin = this._bw.HEAPU32[(this.addr >> 2) + 1];

        if (end === begin) {
            return;
        }

        this._current = begin;

        do {
            yield this._current;
            this._current = this._bw.HEAPU32[(this._current >> 2) + this._pairOffset + 1];
        } while (this._current !== end);
    }

    *reverse() {
        const end = this._bw.HEAPU32[(this.addr >> 2) + 1];
        const begin = this._bw.HEAPU32[(this.addr >> 2)];
        this._current = begin;

        yield this._current;

        while (this._current !== end) {
            this._current = this._bw.HEAPU32[(this._current >> 2) + this._pairOffset];
            yield this._current;
        }
    }

}