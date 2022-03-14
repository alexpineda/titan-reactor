// only works for ints presently for std::vector mapping
export class StdVector {
    protected heap: Int32Array;
    index: number;

    constructor(heap: Int32Array, index: number) {
        this.heap = heap;
        this.index = index;
    }

    get isNull() {
        return this.heap[this.index] === 0;
    }

    get size() {
        let i = 0;

        const addr = this.heap[this.index];
        const end_addr = this.heap[this.index + 1];

        while ((addr + (i << 2)) !== end_addr) {
            i = i + 1;
        }

        return i;
    }

    copyData() {
        const addr = this.heap[this.index];
        const end_addr = this.heap[this.index + 1];

        return this.heap.slice(addr >> 2, end_addr >> 2);
        // return this.heap.slice(this.index, this.index + this.size);
    }

    *[Symbol.iterator](): IterableIterator<number> {
        let i = 0;

        const addr = this.heap[this.index];
        const end_addr = this.heap[this.index + 1];

        while ((addr + (i << 2)) !== end_addr) {
            yield this.heap[(addr >> 2) + i];
            i = i + 1;
        };
    }

}