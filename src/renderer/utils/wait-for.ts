export const waitForSeconds = ( seconds: number ) =>
    new Promise( ( res ) => setTimeout( () => res( null ), seconds * 1000 ) );

export function waitForTruthy(
    fn: ( ...args: any[] ) => unknown,
    polling = 100
): Promise<void> {
    return new Promise( async ( res ) => {
        const r = await fn();
        if ( r ) {
            res();
            return;
        }
        const _t = setInterval( async () => {
            const r = await fn();
            if ( r ) {
                res();
                clearInterval( _t );
                return;
            }
        }, polling );
    } );
}
