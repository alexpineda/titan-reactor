import {
    createDefaultMapFromCDN,
    createSystem,
    createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import ts from "typescript";
import { ipcMain } from "electron";

import {
    EDITOR_GET_TS_COMPLETIONS_AT_POS,
    EDITOR_SET_CONTENTS,
} from "common/ipc-handle-names";

import hostApiTypes from "../../../../build/api-types/host/index.d.ts?raw";

const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    esModuleInterop: true,
};

const fsMapDefaultFull = await createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts
);

const fsMap = new Map<string, string>( fsMapDefaultFull );
fsMap.set( "titan-reactor-host.d.ts", hostApiTypes );
fsMap.set( "index.ts", "" );

const fsMapDefault = new Map();
fsMapDefault.set( "/lib.d.ts", fsMapDefaultFull.get( "/lib.d.ts" ) );
fsMapDefault.set( "/lib.es5.d.ts", fsMapDefaultFull.get( "/lib.es5.d.ts" ) );
fsMapDefault.set( "/lib.es6.d.ts", fsMapDefaultFull.get( "/lib.es6.d.ts" ) );

const system = createSystem( fsMap );

const tsEnv = createVirtualTypeScriptEnvironment(
    system,
    [ ...fsMap.keys() ],
    ts,
    compilerOptions
);

ipcMain.handle( EDITOR_GET_TS_COMPLETIONS_AT_POS, ( _, pos: number ) => {
    // try {
    const completions = tsEnv.languageService.getCompletionsAtPosition(
        "index.ts",
        pos,
        {}
    );

    if ( completions ) {
        return completions.entries.map( ( c ) => ( {
            type: c.kind,
            label: c.name,
        } ) );
    }

    return [];

    // } catch ( e ) {
    //     return [];
    // }
} );

//@TODO support multiple files/ids at once so that types can reach across macros / plugins
ipcMain.handle( EDITOR_SET_CONTENTS, ( _, contents: string ) => {
    // Typescript removes files from fsMap when empty, but index.ts is
    // looked up without checking for existence in other places. Tell
    // typescript that an empty file has a space in it to prevent this
    // empty-remove behavior from happening.
    tsEnv.updateFile( "index.ts", contents || " " );
    return true;
} );
