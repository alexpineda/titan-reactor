export class IterableSet<T> {
    #set: Set<T> = new Set;
    #copy: T[] = [];
    onChange: (values: T[]) => void = () => { }

    constructor(onChange?: (values: T[]) => void) {
        if (onChange) {
            this.onChange = onChange;
        }
    }

    toArray() {
        return this.#copy;
    }

    add(value: T) {
        if (!this.#set.has(value)) {
            this.#copy.push(value);
            this.#set.add(value);
            this.onChange(this.#copy);
        }
    }

    set(values: T[]) {
        this.#copy.length = 0;
        this.#set.clear();
        this.#copy.push(...values);
        for (const value of values) {
            this.#set.add(value);
        }
        this.onChange(this.#copy);
    }

    delete(value: T) {
        const idx = this.#copy.indexOf(value);
        if (idx !== -1) {
            this.#copy.splice(idx, 1);
        }
        this.#set.delete(value);
        this.onChange(this.#copy);
    }

    has(key: T) {
        return this.#set.has(key);
    }

    clear() {
        this.#copy.length = 0;
        this.#set.clear();
        this.onChange(this.#copy);
    }

    [Symbol.iterator]() {
        return this.#copy[Symbol.iterator]();
    }

}