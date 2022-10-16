import { PluginConfig } from "common/types";

export function inverse<T extends ( ...args: any[] ) => any>( fn: T ) {
    return ( ...args: Parameters<T> ) => !fn( ...args );
}

export const throttleFn = ( interval: number ) => {
    let lastElapsed = 0;
    return ( elapsed: number ) => {
        if ( elapsed - lastElapsed > interval ) {
            lastElapsed = elapsed;
            return true;
        }
        return false;
    };
};

export const normalizePluginConfiguration = ( config: PluginConfig ) => {
    const configCopy: Record<string, any> = {};
    Object.keys( config ).forEach( ( key ) => {
        if ( config[key].value !== undefined ) {
            configCopy[key] = config[key].value;
        }
    } );
    return configCopy;
};

export function easeInCubic( x: number ): number {
    return x * x * x;
}
