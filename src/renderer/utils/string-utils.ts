import { Race } from "common/enums";

export const spaceOutCapitalLetters = ( str: string ) =>
    str.replace( /([A-Z])/g, " $1" ).trim();

export const capitalizeFirstLetters = ( str: string ) => {
    return str.replace( /\w\S*/g, ( txt ) => {
        return txt.charAt( 0 ).toUpperCase() + txt.substring( 1 ).toLowerCase();
    } );
};

export const raceToString = ( race: Race ) => {
    switch ( race ) {
        case Race.Zerg:
            return "zerg";
        case Race.Terran:
            return "terran";
        case Race.Protoss:
            return "protoss";
    }
    return "";
};

export function isEmoji( s: string ) {
    return /\p{Emoji}/u.test( s );
}

export function stripEmojis( s: string ) {
    return s.replace( /\p{Emoji}/gu, "" );
}

export const urlJoin = ( ...parts: string[] ) => {
    const url = parts.join( "/" );
    return url.replace( /([^:]\/)\/+/g, "$1" );
}