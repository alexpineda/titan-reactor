export default class Collection<T> {
    #items: T[] = [];
    onSetCollection?: (oldItems: T[], newItems: T[]) => T[];
    onAppendCollection?: (oldItems: T[], newItems: T[]) => T[];
    onClearCollection?: (oldItems: T[]) => void;
    onRemoveItem?: (item: T) => void;

    get length() {
        return this.#items.length;
    }

    get items() {
        return this.#items;
    }
    
    set(items: T[]){
        if (this.onSetCollection) {
            this.#items = this.onSetCollection(this.#items, items);

        } else {
            this.#items = items;
        }
    }

    append(items: T[]) {
        if (this.onAppendCollection) {
            this.#items.push(...this.onAppendCollection(this.#items, items));
        } else {
            this.#items.push(...items);
        }
    }

    clear() {
        if (this.onClearCollection) {
            this.onClearCollection(this.#items);
        }

        this.#items.length =0;
    }

    remove(item: T) {

        if (this.onRemoveItem) {
            this.onRemoveItem(item);
        }
        this.#items.splice(this.#items.indexOf(item), 1);
    }
}