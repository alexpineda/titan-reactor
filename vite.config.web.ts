import { rmSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";
import aliases from "./build/aliases";
import path from "path";
import tsConfig from "./tsconfig.json"
import mkcert from 'vite-plugin-mkcert'

const OUT_DIR = "dist/web";
const TARGET =  tsConfig.compilerOptions.target;

rmSync(OUT_DIR, { recursive: true, force: true }); 

const alias = Object.entries(aliases).reduce(
    (acc, [key, aliasPath]) => {
        acc[key] = path.resolve(aliasPath);
        return acc;
    },
    {
        common: path.resolve("./src/common"),
    }
);

console.log("VSCODE_DEBUG", process.env.VSCODE_DEBUG);
export const sharedViteConfig = ({ command }) => ({
    // titan-reactor is the subfolder in the black-sheep-wall public dir
    base: command === "build" ? "/titan-reactor" : "/",
    define: {
        __static: JSON.stringify(
            command === "build" ? "/resources/bundled" : "/bundled"
        ),
    },
    resolve: {
        alias,
    },
    optimizeDeps: {
        exclude: ["bw-casclib"],
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

// https://vitejs.dev/config/
export default defineConfig((env) => {
    return {
        ...sharedViteConfig(env),
        base: "./",
        logLevel: "info",
        publicDir: "bundled",
        build: {
            outDir: OUT_DIR,
            target: TARGET,
            rollupOptions: {
                input: {
                    index: path.resolve(__dirname, "./index.html"),
                },
            },
            minify: env.command === "build",
            sourcemap: env.command === "build",
        },
        esbuild: {
            target: TARGET,
        },

        worker: {
            format: "es",
        },
        plugins: [
            react(),
            mkcert()
        ],
        server: process.env.VSCODE_DEBUG
            ? {
                  host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
                  port: pkg.debug.env.VITE_DEV_SERVER_PORT,
                  https: true,
                  hmr: false
              }
            : {
               https: true,
               hmr: false
            },
    };
});
