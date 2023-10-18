import { ipcRenderer } from "electron";

import {
    SHOW_FOLDER_DIALOG_REMOTE,
} from "common/ipc-handle-names";

export const showFolderDialog = async (): Promise<undefined | string[]> => {
    return ( await ipcRenderer.invoke( SHOW_FOLDER_DIALOG_REMOTE ) ) as undefined | string[];
};