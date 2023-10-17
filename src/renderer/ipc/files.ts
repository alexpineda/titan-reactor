import { BwDAT } from "common/types";
import { ipcRenderer } from "electron";

import { LOAD_DAT_FILES_REMOTE, OPEN_FILE_REMOTE } from "common/ipc-handle-names";

export const openFile = async ( filepath: string ) => {
    const arrayBuffer = ( await ipcRenderer.invoke(
        OPEN_FILE_REMOTE,
        filepath
    ) ) as Buffer | null;
    if ( arrayBuffer === null ) {
        throw new Error( "File not found" );
    }
    return Buffer.from( arrayBuffer.buffer );
};

export const loadDatFilesRemote = async (): Promise<BwDAT> => {
    return ( await ipcRenderer.invoke( LOAD_DAT_FILES_REMOTE ) ) as BwDAT;
};

export const writeFile = async ( filepath: string ) => {
    const arrayBuffer = ( await ipcRenderer.invoke(
        OPEN_FILE_REMOTE,
        filepath
    ) ) as Buffer | null;
    if ( arrayBuffer === null ) {
        throw new Error( "File not found" );
    }
    return Buffer.from( arrayBuffer.buffer );
};