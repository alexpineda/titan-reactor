import { genIndexContent, getTSEnv } from "./ts-env";
import { ipcMain } from "electron";

import {
    EDITOR_GET_TS_COMPLETIONS_AT_POS,
    EDITOR_SET_CONTENTS,
} from "common/ipc-handle-names";


console.log("registering editor ipc handlers")
ipcMain.handle( EDITOR_GET_TS_COMPLETIONS_AT_POS, async ( _, pos: number ) => {

    const completions = (await getTSEnv()).languageService.getCompletionsAtPosition(
        "/index.ts",
        pos,
        {
            includeCompletionsForModuleExports: true,
            includeCompletionsWithSnippetText: true,
            includeCompletionsWithInsertText: true,
            includeCompletionsWithObjectLiteralMethodSnippets: true,
            useLabelDetailsInCompletionEntries: true,
            allowIncompleteCompletions: true,
        }
    );

    if ( completions ) {
        return completions.entries.map( ( c ) => ( {
            type: c.kind,
            label: c.name,
        } ) );
    }

    return [];

} );

//@TODO support multiple files/ids at once so that types can reach across macros / plugins
ipcMain.handle( EDITOR_SET_CONTENTS, async ( _, contents: string ) => {
    (await getTSEnv()).updateFile( "/index.ts", genIndexContent( contents ) );
    return true;
} );
