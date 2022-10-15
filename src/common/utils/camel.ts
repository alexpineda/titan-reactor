export type AnyObject = Record<string, unknown>;

export const camel = ( str: string ) =>
    str.replace( /-+(.?)/g, ( _, p1 ) => ( p1 as string ).toUpperCase() );
export const snake = ( str: string ) =>
    str
        .replace( /(^[A-Z])/, ( _, p1 ) => ( p1 as string ).toLowerCase() )
        .replace( /([A-Z]+)/g, ( _, p1 ) => `-${( p1 as string ).toLowerCase()}` );

const detectObject = ( obj: unknown ): obj is AnyObject => {
    if ( Object.prototype.toString.call( obj ) === "[object Object]" ) {
        return true;
    }
    return false;
};

const propertyNameConverter =
    ( converterFn: ( s: string ) => string ) =>
    ( data: AnyObject ): object => {
        const recursive = ( obj: AnyObject ): AnyObject => {
            if ( !detectObject( data ) ) {
                return data;
            }
            const keys = Object.keys( obj );
            return keys.reduce( ( accum: object, propName: string ) => {
                const propValue = obj[propName];
                return {
                    ...accum,
                    [converterFn( propName )]: Array.isArray( propValue )
                        ? propValue.map( ( x: unknown ) =>
                              detectObject( x ) ? recursive( x ) : x
                          )
                        : detectObject( propValue )
                        ? recursive( propValue )
                        : propValue,
                };
            }, {} );
        };
        return recursive( data );
    };

export const toSnake = propertyNameConverter( snake );
export const toCamel = propertyNameConverter( camel );
