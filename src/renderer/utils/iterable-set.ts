export class IterableSet<T> {
    #set: Set<T> = new Set;
    #copy: T[] = [];
    externalOnChange: (values: T[]) => void = () => { }

    values() {
        return this.#copy;
    }

    add(value: T) {
        if (!this.#set.has(value)) {
            this.#copy.push(value);
            this.#set.add(value);
            this.externalOnChange(this.#copy);
        }
    }

    set(values: T[]) {
        this.#copy.length = 0;
        this.#set.clear();
        this.#copy.push(...values);
        for (const value of values) {
            this.#set.add(value);
        }
        this.externalOnChange(this.#copy);
    }

    delete(value: T) {
        const idx = this.#copy.indexOf(value);
        if (idx !== -1) {
            this.#copy.splice(idx, 1);
        }
        this.#set.delete(value);
        this.externalOnChange(this.#copy);
    }

    has(key: T) {
        return this.#set.has(key);
    }

    clear() {
        this.#copy.length = 0;
        this.#set.clear();
        this.externalOnChange(this.#copy);
    }

    [Symbol.iterator]() {
        return this.#copy[Symbol.iterator]();
    }

}