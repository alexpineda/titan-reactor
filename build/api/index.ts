import { writeFile } from "fs/promises";
import { fn } from "./util";
import { extractTypesFromFiles } from "./extract-types";
import * as tsm from "ts-morph";

const doThing = async () => {
    const res = await extractTypesFromFiles({
        prependFiles: ["./src/main/plugins/runtime.tsx"],
        files: [
            {
                file: "./src/main/plugins/runtime.tsx",
                //     // file: "./src/renderer/utils/types/runtime.types.ts",
            },
        ],
        validNodeKinds: [
            tsm.SyntaxKind.ClassDeclaration,
            tsm.SyntaxKind.InterfaceDeclaration,
            tsm.SyntaxKind.TypeAliasDeclaration,
            // tsm.SyntaxKind.VariableDeclaration,
            // tsm.SyntaxKind.VariableStatement,
        ],
        // extraTypes: [`/// <reference types="three" />`],
    });

    writeFile(fn("./build/api/out.d.ts"), res.content);
    writeFile(fn("./build/api/prepend.d.ts"), res.prepend);
    writeFile(fn("./build/api/out.json"), JSON.stringify(res.diagnostics, null, 4));
};

doThing();
