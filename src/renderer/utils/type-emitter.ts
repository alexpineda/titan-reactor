export type MatchingKeys<
    TRecord,
    TMatch,
    K extends keyof TRecord = keyof TRecord
> = K extends ( TRecord[K] extends TMatch ? K : never ) ? K : never;

export type VoidKeys<Record> = MatchingKeys<Record, void>;

/**
 * @public
 */
export class TypeEmitter<T> {
    #listeners = new Map<
        keyof T,
        ( ( v: T[keyof T] | undefined ) => undefined | false )[]
    >();

    on<K extends keyof T>( s: K, listener: ( v: T[K] ) => void ) {
        //TODO: fixme
        //@ts-expect-error
        this.#listeners.set( s, ( this.#listeners.get( s ) ?? [] ).concat( listener ) );
        return () => this.off( s, listener );
    }

    off<K extends keyof T>( s: K, listener: ( v: T[K] ) => void ): void {
        this.#listeners.set(
            s,
            ( this.#listeners.get( s ) ?? [] ).filter( ( l ) => l !== listener )
        );
    }

    emit( s: keyof T, v?: T[keyof T] ): undefined | false {
        for ( const listener of this.#listeners.get( s ) ?? [] ) {
            if ( listener( v ) === false ) {
                return false;
            }
        }
    }

    dispose() {
        this.#listeners.clear();
    }
}

/**
 * @public
 */
export class TypeEmitterProxy<T> {
    #host: TypeEmitter<T>;
    #disposers: ( () => void )[] = [];

    constructor( host: TypeEmitter<T> ) {
        this.#host = host;
    }

    on<K extends keyof T>( s: K, listener: ( v: T[K] ) => void ) {
        const dispose = this.#host.on( s, listener );
        this.#disposers.push( dispose );
        return dispose;
    }

    dispose() {
        for ( const dispose of this.#disposers ) dispose();
    }
}
