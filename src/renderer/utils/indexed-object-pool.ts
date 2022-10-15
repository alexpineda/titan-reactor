export class IndexedObjectPool<T> {
    #items = new Map<number, T[]>();

    add( id: number, item: T ) {
        const existing = this.#items.get( id );
        if ( existing ) {
            existing.push( item );
        } else {
            this.#items.set( id, [item] );
        }
    }

    get( id: number ) {
        const existing = this.#items.get( id );
        if ( existing ) {
            return existing.pop();
        }
        return undefined;
    }

    all() {
        return [...this.#items.values()].flat();
    }
}
