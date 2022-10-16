import { dialog } from "electron";

export const showOpenFolderDialog = ( onOpen?: ( filePaths: string[] ) => void ) =>
    dialog
        .showOpenDialog( {
            properties: ["openDirectory"],
        } )
        .then( ( { filePaths, canceled } ) => {
            if ( canceled ) return;
            onOpen && onOpen( filePaths );
            return filePaths;
        } )
        .catch( ( err: Error ) => {
            dialog.showMessageBox( {
                type: "error",
                title: "Error Loading File",
                message: `There was an error selecting path: ${err.message}`,
            } );
        } );

interface OpenFileDialogOptions {
    title: string;
    extensions: string[];
    defaultPath?: string;
    multiSelect?: boolean;
}

export const showOpenFileDialog = function ( options: OpenFileDialogOptions ) {
    const { title, extensions, defaultPath, multiSelect } = Object.assign( {}, options );

    const filters = [{ name: title, extensions }];
    const multiSelections = ["openFile"];
    if ( multiSelect ) {
        multiSelections.push( "multiSelections" );
    }

    return dialog
        .showOpenDialog( {
            properties: multiSelections as keyof typeof dialog.showOpenDialog,
            filters,
            defaultPath,
        } )
        .then( ( { filePaths, canceled } ) => {
            if ( canceled ) return;
            return filePaths;
        } )
        .catch( ( err: Error ) => {
            dialog.showMessageBox( {
                type: "error",
                title: "Error Loading File",
                message: `There was an error loading this file: ${err.message}`,
            } );
        } );
};
