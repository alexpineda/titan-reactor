type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

interface Get<T> {
    get: (address: number) => T;
}

class ValueBufferView<T> {
    get(address: T) {
        return address;
    }
};

export class Vector<R, T extends Get<R>> {
    private _heap: TypedArray;
    private _size = 0;
    count = 0;
    addr: number;

    constructor(heap: TypedArray, addr: number, count: number) {
        this._heap = heap;
        this._size = heap.BYTES_PER_ELEMENT >> 1;
        this.addr = addr;
        this.count = count;
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.count; i++) {
            yield this._heap[(this.addr >> this._size) + i];
        }
    }

}