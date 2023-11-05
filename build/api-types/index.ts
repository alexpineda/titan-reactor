import { writeFile } from "fs/promises";
import { fn } from "./util";

import { unrollTypes } from "./unroll-types";

const doThing = async () => {
    console.log("building runtime types");
    const runtimeTypes = await unrollTypes({
        tsConfigFilePath: fn("./tsconfig.json"),
        inFiles: ["./src/runtime.tsx"],
        defaultInternal: true,
        globalExternals: [
            `var registerComponent: ( component: Partial<Pick<Component, "order" | "snap" | "screen">>, JSXElement: React.FC<any> ) => void;`,
        ]
    });
    writeFile(
        fn("./build/api-types/ui/unrolled.json"),
        JSON.stringify(runtimeTypes.diagnostics, null, 4)
    );
    writeFile(fn("./build/api-types/ui/index.d.ts"), runtimeTypes.content);

    console.log("building plugin host types");
    const pluginHostTypes = await unrollTypes({
        tsConfigFilePath: fn("./tsconfig.json"),
        inFiles: ["./src/renderer/utils/types/plugin-host-types.ts"],
        defaultInternal: true,
        compilerOptions: {
            allowJs: false,
        },
        prefix: `/// <reference types="node" />
import { Janitor } from "three-janitor";
`,
        wrapInGlobal: ["PluginBase", "SceneController", "enums", "context"],
        globalExternals: [
            `var THREE: typeof import("three");`,
            `var postprocessing: typeof import("postprocessing");`,
            `var CameraControls: typeof import("camera-controls");`,
            //todo properly type common/enums
            `var enums: any;`,
            `var Janitor: typeof Janitor;`,
        ]
    });
    writeFile(
        fn("./build/api-types/host/unrolled.json"),
        JSON.stringify(pluginHostTypes.diagnostics, null, 4)
    );
    writeFile(fn("./build/api-types/host/index.d.ts"), pluginHostTypes.content);
};

doThing();
