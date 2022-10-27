import { writeFile } from "fs/promises";
import { fn } from "./util";
import { extractTypesFromFiles } from "./extract-types";

const doThing = async () => {
    const res = await extractTypesFromFiles({
        files: [
            {
                file: "./src/renderer/utils/types/runtime.types.ts",
            },
        ],
        globalIgnore: [],
        // extraTypes: [`/// <reference types="three" />`],
        prependFiles: [],
    });

    writeFile(fn("./build/api/out.d.ts"), res.content);
    writeFile(fn("./build/api/out.json"), JSON.stringify(res.diagnostics, null, 4));
};

doThing();
