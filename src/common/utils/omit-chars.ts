export default ( str: string ) =>
    Array.from( str )
        .filter( ( char ) => char.charCodeAt( 0 ) > 0x17 )
        .join( "" );
