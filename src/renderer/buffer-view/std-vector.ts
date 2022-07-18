// only works for ints presently for std::vector mapping
export class StdVector {
    protected heap: Int32Array;
    addr32: number;

    constructor(heap: Int32Array, addr32: number) {
        this.heap = heap;
        this.addr32 = addr32;
    }

    get isNull() {
        return this.heap[this.addr32] === 0;
    }

    get size() {
        let i = 0;

        const addr = this.heap[this.addr32];
        const end_addr = this.heap[this.addr32 + 1];

        while ((addr + (i << 2)) !== end_addr) {
            i = i + 1;
        }

        return i;
    }

    copyData() {
        const addr = this.heap[this.addr32];
        const end_addr = this.heap[this.addr32 + 1];

        return this.heap.slice(addr >> 2, end_addr >> 2);
        // return this.heap.slice(this.index, this.index + this.size);
    }

    copyDataShallow() {
        const addr = this.heap[this.addr32];
        const end_addr = this.heap[this.addr32 + 1];

        return this.heap.subarray(addr >> 2, end_addr >> 2);
        // return this.heap.slice(this.index, this.index + this.size);
    }

    get isEmpty() {
        return this.heap[this.addr32] === this.heap[this.addr32 + 1];
    }

    *[Symbol.iterator](): IterableIterator<number> {
        let i = 0;

        const addr = this.heap[this.addr32];
        const end_addr = this.heap[this.addr32 + 1];

        while ((addr + (i << 2)) !== end_addr) {
            yield this.heap[(addr >> 2) + i];
            i = i + 1;
        };
    }

}