import { writeFile } from "fs/promises";
import { fn } from "./util";

import { unrollTypes } from "./unroll-types";

const doThing = async () => {
    console.log("building runtime types");
    const runtimeTypes = await unrollTypes({
        tsConfigFilePath: fn("./tsconfig.json"),
        inFiles: ["./src/main/plugins/runtime.tsx"],
        defaultInternal: true,
    });
    writeFile(
        fn("./build/api/publish/titan-reactor-runtime/unrolled.json"),
        JSON.stringify(runtimeTypes.diagnostics, null, 4)
    );
    writeFile(
        fn("./build/api/publish/titan-reactor-runtime/index.d.ts"),
        runtimeTypes.content
    );

    console.log("building plugin host types");
    const pluginHostTypes = await unrollTypes({
        tsConfigFilePath: fn("./tsconfig.json"),
        inFiles: ["./src/renderer/utils/types/plugin-host-types.ts"],
        defaultInternal: true,
        compilerOptions: {
            allowJs: false,
        },
        wrapInGlobal: ["PluginBase", "SceneController"],
    });
    writeFile(
        fn("./build/api/publish/titan-reactor-host/unrolled.json"),
        JSON.stringify(pluginHostTypes.diagnostics, null, 4)
    );
    writeFile(
        fn("./build/api/publish/titan-reactor-host/index.d.ts"),
        pluginHostTypes.content
    );
};

doThing();
