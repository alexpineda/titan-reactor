import * as casclibDisk from "./casclib-disk";
import * as casclib from "bw-casclib";

let _storageHandle: any, _storagePath: string, _storageIsCasc: boolean;

export const setStoragePath = ( path: string ) => {
    _storagePath = path;
};

export const setStorageIsCasc = ( isCasc: boolean ) => {
    _storageIsCasc = isCasc;
};

export const readCascFile = async ( filePath: string ): Promise<Buffer> => {
    if ( !_storageIsCasc ) {
        return casclibDisk.readCascFile( filePath, _storagePath );
    }
    return await casclib.readFile( _storageHandle, filePath );
};

export const findFile = async ( fileName: string ) => {
    if ( !_storageIsCasc ) {
        return casclibDisk.findFile( fileName, _storagePath );
    }
    const files = await casclib.findFiles( _storageHandle, `*${fileName}` );
    if ( files.length === 0 ) {
        return undefined;
    }
    return files[0].fullName;
};

export const findFiles = async ( fileName: string ) => {
    if ( !_storageIsCasc ) {
        throw new Error( "Not implemented" );
    }
    return ( await casclib.findFiles( _storageHandle, `*${fileName}` ) ).map(
        ( { fullName } ) => fullName
    );
};

export const openCascStorage = async ( bwPath: string ) => {
    if ( !_storageIsCasc ) {
        return;
    }
    if ( _storageHandle ) {
        casclib.closeStorage( _storageHandle );
    }
    try {
        _storageHandle = ( await casclib.openStorage( bwPath ) ) as unknown;
    } catch ( e ) {
        throw new Error( `Failed to open CASC storage at ${bwPath}` );
    }
};

export const closeCascStorage = () => {
    if ( !_storageIsCasc ) {
        return;
    }
    _storageHandle && casclib.closeStorage( _storageHandle );
};

export default readCascFile;
