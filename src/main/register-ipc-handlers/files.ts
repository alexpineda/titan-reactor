
// import { LOAD_DAT_FILES_REMOTE, OPEN_FILE_REMOTE } from "common/ipc-handle-names";
// import { promises as fsPromises } from "fs";
// import settings from "../settings/singleton";
// import { loadDATFiles } from "common/bwdat/load-dat-files";
// import { openCascStorage, readCascFile, closeCascStorage } from "common/casclib";

// ipcMain.handle( OPEN_FILE_REMOTE, async ( _, filepath: string = "" ) => {
//     try {
//         return await fsPromises.readFile( filepath );
//     } catch ( e ) {
//         return null;
//     }
// } );

// ipcMain.handle( LOAD_DAT_FILES_REMOTE, async () => {
//     try {
//         await openCascStorage( settings.get().directories.starcraft );
//     } catch ( e ) {
//         return {};
//     }

//     const datFiles = await loadDATFiles( readCascFile );

//     closeCascStorage();
    
//     return datFiles;
// } );
