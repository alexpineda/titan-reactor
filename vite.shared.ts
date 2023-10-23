import aliases from "./build/aliases";
import { ConfigEnv, UserConfigExport } from "vite";
import path from "path";
import tsConfig from "./tsconfig.json";

const alias = Object.entries(aliases).reduce(
    (acc, [key, aliasPath]) => {
        acc[key] = path.resolve(aliasPath);
        return acc;
    },
    {
        common: path.resolve("./src/common"),
    }
);

export const sharedViteConfig: () => UserConfigExport = () => ({
    // titan-reactor is the subfolder in the black-sheep-wall public dir
    resolve: {
        alias,
    },
    optimizeDeps: {
        esbuildOptions: {
            target: tsConfig.compilerOptions.target,
            define: {
                global: "globalThis",
            },
            supported: {
                bigint: true,
            },
        },
    },
});
