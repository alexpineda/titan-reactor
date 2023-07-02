import {
    VirtualTypeScriptEnvironment,
    createDefaultMapFromCDN,
    createSystem,
    createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import ts from "typescript";

import hostApiTypes from "../../../../build/api-types/host/index.d.ts?raw";

let _tsEnv: VirtualTypeScriptEnvironment | null = null;

export const getTSEnv = async () => {

    if (_tsEnv) {
        return _tsEnv;
    }

    const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ESNext,
        esModuleInterop: true,
        lib: ["DOM", "DOM.Iterable", "ESNext"],
        typeRoots: ["/@types"],
    };

    const fsMapDefaultFull = await createDefaultMapFromCDN(
        compilerOptions,
        ts.version,
        false,
        ts
    );

    const fsMapDefault = new Map();
    fsMapDefault.set("/@types/lib.d.ts", fsMapDefaultFull.get("/lib.d.ts"));
    fsMapDefault.set("/@types/lib.dom.d.ts", fsMapDefaultFull.get("/lib.dom.d.ts"));
    fsMapDefault.set("/@types/lib.es5.d.ts", fsMapDefaultFull.get("/lib.es5.d.ts"));
    fsMapDefault.set("/@types/lib.es6.d.ts", fsMapDefaultFull.get("/lib.es6.d.ts"));
    fsMapDefault.set("/@types/lib.dom.iterable.d.ts", fsMapDefaultFull.get("/lib.dom.iterable.d.ts"));

    const fsMap = new Map<string, string>(fsMapDefault);
    fsMap.set("/@types/titan-reactor-host.d.ts", 
    
    `
    ${hostApiTypes}
    declare global {
        const api: GameTimeApi;
        const plugins: PluginVariables;
        const settings: SessionVariables;
        const events: TypeEmitterProxy<WorldEvents>;
        const customEvents: TypeEmitter<any>;
    }

    `
    );
    fsMap.set("/index.ts", genIndexContent(""));

    const system = createSystem(fsMap);

    _tsEnv = createVirtualTypeScriptEnvironment(
        system,
        [...fsMap.keys()],
        ts,
        compilerOptions
    );
    return _tsEnv;
}

getTSEnv();


/**
 * Sets index.ts content which represents the currently edited macro.
 * I'd prefer to do this using declare global { ... } but it I haven't found a way to make it work.
 * @see createMacrosComposer.setContainer
 * @see apiSession.activate
 * @param content the content of index.ts
 */
export const genIndexContent = (content: string) => {
    
    // not a real representation of the environment, just enough to make the editor happy
    //TODO: add more types, will likely need to expose TypedEmitter
    return `
    ${content} `
}

// api: gameTimeApi,
//                 plugins: borrow( this.#plugins.store.vars ),
//                 settings: borrow( settings.vars ),
//                 events: eventsProxy,
//                 customEvents,