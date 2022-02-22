/**
 * Represents an openbw intrusive_list
 */
export class IntrusiveList {
    private _heapU32: Uint32Array;
    private _pairOffset: number;
    private _current = 0;
    addr: number;

    constructor(heap: Uint32Array, addr = 0, pairOffset = 0) {
        this._heapU32 = heap;
        this.addr = addr;
        this._pairOffset = pairOffset;
    }

    *[Symbol.iterator]() {
        const end = this._heapU32[(this.addr >> 2)];
        const begin = this._heapU32[(this.addr >> 2) + 1];
        if (this._heapU32[(end >> 2)] === end) {
            return;
        }

        this._current = begin;
        yield this._current;

        while (this._current !== end) {
            this._current = this._heapU32[(this._current >> 2) + this._pairOffset + 1];
            yield this._current;
        }
    }

    *reverse() {
        const end = this._heapU32[(this.addr >> 2) + 1];
        const begin = this._heapU32[(this.addr >> 2)];

        if (this._heapU32[(end >> 2)] === end) {
            return;
        }

        this._current = begin;
        yield this._current;

        while (this._current !== end) {
            this._current = this._heapU32[(this._current >> 2) + this._pairOffset];
            yield this._current;
        }
    }

}