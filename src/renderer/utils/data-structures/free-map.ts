type Factory<K> = () => K;
export class FreeMap<T, K> {
    #objects = new Map<T, K>();
    #freeObjects = new Array<K>();
    #factory: Factory<K>;

    constructor( factory: Factory<K> ) {
        this.#factory = factory;
    }

    maybe( index: T ) {
        return this.#objects.get( index );
    }

    get( index: T ) {
        if ( this.#objects.has( index ) ) {
            return this.#objects.get( index ) as K;
        }
        const object = this.#freeObjects.pop() ?? this.#factory();
        this.#objects.set( index, object );
        return object;
    }

    delete( index: T ) {
        this.#freeObjects.push( this.#objects.get( index ) as K );
        this.#objects.delete( index );
    }

    has( index: T ) {
        return this.#objects.has( index );
    }

    clear() {
        this.#freeObjects.push( ...this.#objects.values() );
        this.#objects.clear();
    }

    dispose() {
        this.#objects.clear();
        this.#freeObjects.length = 0;
    }
}
