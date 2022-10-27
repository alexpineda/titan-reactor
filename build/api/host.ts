import { writeFile } from "fs/promises";
import { fn } from "./util";
import { extractTypesFromFiles } from "./extract-types";

(async () => {
    writeFile(
        fn("./src/common/types/declarations/titan-reactor-host.d.ts"),
        `declare module "titan-reactor/host" {\n` +
            (await extractTypesFromFiles({
                files: [
                    {
                        file: "**/types/plugin.ts",
                        types: ["PluginMetaData", "SceneInputHandler"],
                    },
                    {
                        file: "**/bwdat/bw-dat.ts",
                    },
                    {
                        file: "**/minimap-dimensions.ts",
                    },
                    {
                        file: "**/parse-replay-header.ts",
                        types: ["ReplayPlayer"],
                    },
                    {
                        file: "**/plugin-system-ui.ts",
                        types: ["PluginStateMessage", "ReplayPlayer"],
                    },
                    {
                        file: "**/plugin-system-native.ts",
                        types: ["PluginProto"],
                    },
                    {
                        file: "**/scenes/scene.ts",
                        types: ["SceneStateID"],
                    },
                    {
                        file: "**/assets.ts",
                        types: ["UIStateAssets"],
                        ignoreReferences: ["Assets", "Pick"],
                    },
                    {
                        file: "**/icons.ts",
                    },
                    {
                        file: "**/core/unit.ts",
                    },
                ],
                globalIgnore: ["SpritesBufferView", "Vector2"],
                extraTypes: [
                    "type Vector2 = {x:number,y:number}",
                    // ,
                    // `
                    // export class PluginBase implements NativePlugin {
                    //     id: string;
                    //     name: string;
                    //     $$permissions: NativePlugin["$$permissions"];
                    //     $$config: NativePlugin["$$config"];
                    //     $$meta: NativePlugin["$$meta"];
                    //     sendUIMessage: NativePlugin["sendUIMessage"];
                    //     setConfig(key: string, value: any, persist?: boolean): void
                    // }
                    // `
                ],
                prependFiles: [fn("./src/renderer/plugins/events.ts")],
            })) +
            "\n}",
        { encoding: "utf8" }
    );
})();
