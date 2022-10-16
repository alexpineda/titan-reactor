export interface EntityIterator<T> {
    items: ( count?: number ) => IterableIterator<T>;
    reverse: ( count?: number ) => IterableIterator<T>;
    instances: ( count?: number ) => T[];
}

// mostly for compatibility with the old API (BufferView)
export class EmbindEntityInterator<T> implements EntityIterator<T> {
    private _items: T[] = [];

    assign( items: T[] ) {
        this._items = items;
    }

    *items( count = this._items.length ) {
        for ( let i = 0; i < count; i++ ) {
            yield this._items[i];
        }
    }

    *reverse( count = this._items.length ) {
        for ( let i = count - 1; i > 0; i-- ) {
            yield this._items[i];
        }
    }

    instances() {
        return this._items;
    }
}
