// import { ipcRenderer } from "electron";

// import {
//     OPEN_CASCLIB_REMOTE,
//     OPEN_CASCLIB_FILE_REMOTE,
//     OPEN_CASCLIB_BATCH_REMOTE,
//     CLOSE_CASCLIB_REMOTE,
// } from "common/ipc-handle-names";
import { REMOTE_HOST_URL } from "common/tmp-common";
import {
    // FindCascFiles,
    ReadCascFile,
    // ReadCascFileBatch,
} from "common/types";

export const openCascStorageRemote = async () => {
    const res = await fetch( `${REMOTE_HOST_URL}?open=true` );
    return res.ok;
};

export const closeCascStorageRemote = async () => {
    const res = await fetch( `${REMOTE_HOST_URL}?close=true` );
    return res.ok;
};

export const readCascFileRemote: ReadCascFile = async (
    filepath: string
    // encoding?: BufferEncoding
) => {
    // const arrayBuffer = await ipcRenderer.invoke( OPEN_CASCLIB_FILE_REMOTE, filepath, encoding );
    // return Buffer.from(arrayBuffer.buffer);
    // return Buffer.from(arrayBuffer);
    const res = await fetch( `${REMOTE_HOST_URL}/${filepath}` );
    return Buffer.from( await res.arrayBuffer() );
};
