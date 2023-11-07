// import { ipcRenderer } from "electron";

export const openFile = ( file: File ) => {
    return new Promise<ArrayBuffer>( ( resolve, reject ) => {
        const reader = new FileReader();
        reader.onloadend = function ( e ) {
            if ( !e.target!.error && e.target!.readyState != FileReader.DONE )
                reject( "FileReader aborted" );
            if ( e.target!.error ) reject( e.target!.error );

            resolve( e.target!.result as ArrayBuffer );
        };
        reader.readAsArrayBuffer( file );
    } );
};

export type PreProcessFile = {
    name: string;
    buffer: ArrayBuffer;
}