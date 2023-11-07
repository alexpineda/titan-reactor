export class IterableSet<T> {
    #set = new Set<T>();
    #copy: T[] = [];
    onChange: ( values: T[] ) => void = () => {};

    constructor( onChange?: ( values: T[] ) => void ) {
        if ( onChange ) {
            this.onChange = onChange;
        }
    }

    copyAsArray() {
        return this.#copy.slice();
    }

    get size() {
        return this.#copy.length;
    }

    get _dangerousArray() {
        return this.#copy;
    }

    add( value: T ) {
        if ( !this.#set.has( value ) ) {
            this.#copy.push( value );
            this.#set.add( value );
            this.onChange( this.#copy );
        }
    }

    set( values: T[] ) {
        this.#copy.length = 0;
        this.#set.clear();
        this.#copy.push( ...values );
        for ( const value of values ) {
            this.#set.add( value );
        }
        this.onChange( this.#copy );
    }

    delete( value: T ) {
        if ( this.#set.has( value ) ) {
            const idx = this.#copy.indexOf( value );
            if ( idx !== -1 ) {
                this.#copy.splice( idx, 1 );
            }
            this.#set.delete( value );
        }
    }

    has( key: T ) {
        return this.#set.has( key );
    }

    clear() {
        this.#copy.length = 0;
        this.#set.clear();
        this.onChange( this.#copy );
    }

    [Symbol.iterator]() {
        return this.#copy[Symbol.iterator]();
    }
}
