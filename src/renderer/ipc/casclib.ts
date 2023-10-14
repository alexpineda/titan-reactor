import { ipcRenderer } from "electron";

import {
    OPEN_CASCLIB,
    OPEN_CASCLIB_FILE,
    OPEN_CASCLIB_BATCH,
    CLOSE_CASCLIB,
} from "common/ipc-handle-names";
import {
    CloseCascStorage,
    OpenCascStorage,
    ReadCascFile,
    ReadCascFileBatch,
} from "common/types";

export const openCascStorageRemote: OpenCascStorage = async ( bwPath: string ) => {
    return await ipcRenderer.invoke( OPEN_CASCLIB, bwPath );
};

export const closeCascStorageRemote: CloseCascStorage = () => {
    ipcRenderer.invoke( CLOSE_CASCLIB );
};

export const readCascFileRemote: ReadCascFile = async (
    filepath: string,
    encoding?: BufferEncoding
) => {
    const arrayBuffer = await ipcRenderer.invoke( OPEN_CASCLIB_FILE, filepath, encoding );
    // return Buffer.from(arrayBuffer.buffer);
    return arrayBuffer;
};

export const readCascFileBatchRemote: ReadCascFileBatch = async (
    filepaths: string[],
    encoding?: BufferEncoding
) => {
    const arrayBuffers = await ipcRenderer.invoke(
        OPEN_CASCLIB_BATCH,
        filepaths,
        encoding
    );
    // return arrayBuffers.map((b: Uint8Array) => Buffer.from(b.buffer));
    return arrayBuffers;
};
