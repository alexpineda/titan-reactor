import { KeyComboDTO } from "@macros/key-combo";

export const testKeys = ( e: KeyboardEvent, keys: string | undefined ) => {
    if ( keys === undefined ) {
        return false;
    }
    return keys.split( "," ).some( ( key ) => testKey( e, key ) );
};

export const testKey = ( e: KeyboardEvent, key: string | undefined ) => {
    if ( !key ) return false;
    return e.code === key.trim().slice( -e.code.length );
};

export const keyComboWeight = ( key: KeyComboDTO ) => {
    let w = key.codes.length;
    if ( key.ctrlKey ) {
        w++;
    }
    if ( key.altKey ) {
        w++;
    }
    if ( key.shiftKey ) {
        w++;
    }
    return w;
};
