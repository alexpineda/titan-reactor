import { gameSpeeds } from "common/utils/conversions";
import create from "zustand";

export interface IScriptahStore {
    error: any;

    gameTick: number;

    unitImageTab: string;

    autoUpdate: boolean;

    gamespeed: number;
}

export const useIScriptahStore = create<IScriptahStore>( () => ( {
    error: null,
    gameTick: 0,
    unitImageTab: "units",
    autoUpdate: true,
    gamespeed: gameSpeeds.fastest,
} ) );

export const setAutoupdate = ( autoUpdate: boolean ) =>
    useIScriptahStore.setState( { autoUpdate } );

export const setGamespeed = ( gamespeed: number ) =>
    useIScriptahStore.setState( { gamespeed } );

export const setError = ( error: Error ) => useIScriptahStore.setState( { error } );

export const setUnitImageTab = ( unitImageTab: string ) =>
    useIScriptahStore.setState( { unitImageTab } );

export const setGameTick = ( gameTick: number ) =>
    useIScriptahStore.setState( { gameTick } );

export const incGameTick = () =>
    useIScriptahStore.setState( ( state ) => ( {
        gameTick: state.gameTick + 1,
    } ) );
