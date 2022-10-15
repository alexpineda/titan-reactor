export class IterableMap<T, R> {
    #map = new Map<T, R>();
    #copy: R[] = [];

    get( key: T ): R | undefined {
        return this.#map.get( key );
    }

    set( key: T, value: R ) {
        this.#copy.push( value );
        this.#map.set( key, value );
    }

    delete( key: T ) {
        const idx = this.#copy.indexOf( this.#map.get( key )! );
        if ( idx !== -1 ) {
            this.#copy.splice( idx, 1 );
        }
        this.#map.delete( key );
    }

    has( key: T ) {
        return this.#map.has( key );
    }

    clear() {
        this.#copy.length = 0;
        this.#map.clear();
    }

    [Symbol.iterator]() {
        return this.#copy[Symbol.iterator]();
    }

    get length() {
        return this.#copy.length;
    }
}
