type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;

// only works for ints presently for std::vector mapping
export class StdVector<T extends TypedArray> {
    protected heap: T;

    address: number;
    #shift = 0;

    constructor(heap: T, address: number) {
        this.heap = heap;

        if (heap instanceof Int8Array || heap instanceof Uint8Array) {
            this.address = address;
            this.#shift = 0;
        } else if (heap instanceof Int16Array || heap instanceof Uint16Array) {
            this.address = address >> 1;
            this.#shift = 1;
        } else if (heap instanceof Int32Array || heap instanceof Uint32Array) {
            this.address = address >> 2;
            this.#shift = 2;
        } else {
            throw new Error("Unsupported heap type");
        }
    }

    get isNull() {
        return this.heap[this.address] === 0;
    }

    get size() {
        let i = 0;

        const addr = this.heap[this.address];
        const end_addr = this.heap[this.address + 1];

        while ((addr + (i << this.#shift)) !== end_addr) {
            i = i + 1;
        }

        return i;
    }

    copyData() {
        const addr = this.heap[this.address];
        const end_addr = this.heap[this.address + 1];

        return this.heap.slice(addr >> this.#shift, end_addr >> this.#shift) as T;
    }

    copyDataShallow() {
        const addr = this.heap[this.address];
        const end_addr = this.heap[this.address + 1];

        return this.heap.subarray(addr >> this.#shift, end_addr >> this.#shift) as T;
        // return this.heap.slice(this.index, this.index + this.size);
    }

    get isEmpty() {
        return this.heap[this.address] === this.heap[this.address + 1];
    }

    *[Symbol.iterator](): IterableIterator<number> {
        let i = 0;

        const addr = this.heap[this.address];
        const end_addr = this.heap[this.address + 1];

        while ((addr + (i << this.#shift)) !== end_addr) {
            yield this.heap[(addr >> this.#shift) + i];
            i = i + 1;
        }
    }

}