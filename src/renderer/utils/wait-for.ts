export const waitForSeconds = ( seconds: number ) =>
    new Promise( ( res ) => setTimeout( () => res( null ), seconds * 1000 ) );

export function waitForTruthy<T>( fn: ( ...args: any[] ) => T, polling = 100 ): Promise<T> {
    return new Promise<T>( ( res ) => {
        const r = fn();
        if ( r ) {
            res( r );
            return;
        }
        const _t = setInterval( () => {
            const r = fn();
            if ( r ) {
                res( r );
                clearInterval( _t );
                return;
            }
        }, polling );
    } );
}
