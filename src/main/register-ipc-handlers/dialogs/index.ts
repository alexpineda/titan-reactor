import { ipcMain  } from "electron";

import {
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
