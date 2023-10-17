import { ipcRenderer } from "electron";

import {
    OPEN_CASCLIB_REMOTE,
    OPEN_CASCLIB_FILE_REMOTE,
    OPEN_CASCLIB_BATCH_REMOTE,
    CLOSE_CASCLIB_REMOTE,
} from "common/ipc-handle-names";
import {
    CloseCascStorage,
    OpenCascStorage,
    ReadCascFile,
    ReadCascFileBatch,
} from "common/types";

export const openCascStorageRemote: OpenCascStorage = async ( bwPath: string ) => {
    return await ipcRenderer.invoke( OPEN_CASCLIB_REMOTE, bwPath );
};

export const closeCascStorageRemote: CloseCascStorage = () => {
    ipcRenderer.invoke( CLOSE_CASCLIB_REMOTE );
};

export const readCascFileRemote: ReadCascFile = async (
    filepath: string,
    encoding?: BufferEncoding
) => {
    const arrayBuffer = await ipcRenderer.invoke( OPEN_CASCLIB_FILE_REMOTE, filepath, encoding );
    // return Buffer.from(arrayBuffer.buffer);
    return arrayBuffer;
};

export const readCascFileBatchRemote: ReadCascFileBatch = async (
    filepaths: string[],
    encoding?: BufferEncoding
) => {
    const arrayBuffers = await ipcRenderer.invoke(
        OPEN_CASCLIB_BATCH_REMOTE,
        filepaths,
        encoding
    );
    // return arrayBuffers.map((b: Uint8Array) => Buffer.from(b.buffer));
    return arrayBuffers;
};
