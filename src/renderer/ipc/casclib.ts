// import { ipcRenderer } from "electron";

// import {
//     OPEN_CASCLIB_REMOTE,
//     OPEN_CASCLIB_FILE_REMOTE,
//     OPEN_CASCLIB_BATCH_REMOTE,
//     CLOSE_CASCLIB_REMOTE,
// } from "common/ipc-handle-names";
import {
    // FindCascFiles,
    ReadCascFile,
    // ReadCascFileBatch,
} from "common/types";

let _cascurl = "";

export const getCascUrl = () => _cascurl;

export const openCascStorageRemote = async ( url = _cascurl ) => {
    _cascurl = url;
    return await fetch( `${_cascurl}?open=true` )
        .then( ( res ) => res.ok )
        .catch( () => false );
};

export const closeCascStorageRemote = async () => {
    await fetch( `${_cascurl}?close=true` );
};

export const readCascFileRemote: ReadCascFile = async (
    filepath: string
    // encoding?: BufferEncoding
) => {
    // const arrayBuffer = await ipcRenderer.invoke( OPEN_CASCLIB_FILE_REMOTE, filepath, encoding );
    // return Buffer.from(arrayBuffer.buffer);
    // return Buffer.from(arrayBuffer);
    const res = await fetch( `${_cascurl}/${filepath}` );
    return Buffer.from( await res.arrayBuffer() );
};
