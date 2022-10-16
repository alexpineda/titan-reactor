/**
 * Represents an openbw intrusive_list
 */
export class IntrusiveList {
    private _heapU32: WeakRef<Uint32Array>;
    private _pairOffset: number;
    private _current = 0;
    addr: number;

    get #heap() {
        return this._heapU32.deref();
    }

    constructor( heap: Uint32Array, addr = 0, pairOffset = 0 ) {
        this._heapU32 = new WeakRef( heap );
        this.addr = addr;
        this._pairOffset = pairOffset;
    }

    *[Symbol.iterator]() {
        const heap = this.#heap!;

        const end = heap[this.addr >> 2];
        const begin = heap[( this.addr >> 2 ) + 1];
        if ( heap[end >> 2] === end ) {
            return;
        }

        this._current = begin;
        yield this._current;

        while ( this._current !== end ) {
            this._current = heap[( this._current >> 2 ) + this._pairOffset + 1];
            yield this._current;
        }
    }

    *reverse() {
        const heap = this.#heap!;

        const end = heap[( this.addr >> 2 ) + 1];
        const begin = heap[this.addr >> 2];

        if ( heap[end >> 2] === end ) {
            return;
        }

        this._current = begin;
        yield this._current;

        while ( this._current !== end ) {
            this._current = heap[( this._current >> 2 ) + this._pairOffset];
            yield this._current;
        }
    }
}
