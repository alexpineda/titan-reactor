import { ipcMain, shell } from "electron";
import { whiteListRegex, whitelistUrls } from "../../whitelist-urls";

import {
    OPEN_URL_REMOTE,
    SHOW_FOLDER_DIALOG_REMOTE,
} from "common/ipc-handle-names";
import { showOpenFileDialog, showOpenFolderDialog } from "./api";

export const showOpenMapDialog = () =>
    showOpenFileDialog( {
        title: "Starcraft Map",
        extensions: ["scm", "scx"],
    } );

export const showOpenReplayDialog = ( multiSelect = true ) =>
    showOpenFileDialog( {
        title: "Starcraft Replay",
        extensions: ["rep"],
        multiSelect,
    } );

ipcMain.handle( SHOW_FOLDER_DIALOG_REMOTE, () => showOpenFolderDialog() );

ipcMain.on( OPEN_URL_REMOTE, ( _, url: string ) => {
    const isWhitelisted =
        whitelistUrls.some( ( whitelistedUrl ) => whitelistedUrl === url ) ||
        whiteListRegex.some( ( regex ) => regex.test( url ) );

    if ( isWhitelisted ) {
        shell.openExternal( url, { activate: true } );
    }
} );
