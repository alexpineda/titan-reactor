
let _indexOf: number;

export class SparseList<T> {
    #list: (T | null)[] = [];
    #emptyIndices: number[] = [];

    add(item: T) {
        this.#list[this.#emptyIndices.pop() ?? this.#list.length] = item;
    }

    delete(item: T) {
        _indexOf = this.#list.indexOf(item);
        if (_indexOf !== -1) {
            this.#list[_indexOf] = null;
            this.#emptyIndices.push(_indexOf);
        }
    }

    clear() {
        this.#list.length = 0;
        this.#emptyIndices.length = 0;
    }

    *[Symbol.iterator]() {
        for (const item of this.#list) {
            if (item !== null) {
                yield item;
            }
        }
    }
}