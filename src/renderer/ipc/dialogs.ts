import { ipcRenderer } from "electron";

import {
    OPEN_URL_REMOTE,
    SHOW_FOLDER_DIALOG_REMOTE,
} from "common/ipc-handle-names";

export const showFolderDialog = async (): Promise<undefined | string[]> => {
    return ( await ipcRenderer.invoke( SHOW_FOLDER_DIALOG_REMOTE ) ) as undefined | string[];
};
 
export const openUrl = ( url: string ) => {
    ipcRenderer.send( OPEN_URL_REMOTE, url );
};
