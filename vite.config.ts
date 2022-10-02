import { rmSync } from "fs"
import { defineConfig } from "vite"
import electron, { onstart } from "vite-plugin-electron"
import esmodule from "vite-plugin-esmodule"
import react from "@vitejs/plugin-react"
import pkg from "./package.json"
import aliases from "./build/aliases";
import path from "path"

rmSync("dist", { recursive: true, force: true }) // v14.14.0

const alias = Object.entries(aliases).reduce((acc, [key, aliasPath]) => {
    acc[key] = path.resolve(aliasPath);
    return acc
}, {
    "common": path.resolve("./src/common"),
})

const sharedViteConfig = ({ command }) => ({
    define: {
        "__static": JSON.stringify(command === "build" ? "./resources/bundled" : "./bundled")
    },
    resolve: {
        alias
    },
    optimizeDeps: {
        exclude: ["bw-casclib"]
    },
});

// https://vitejs.dev/config/
export default defineConfig((env) => {

    return {

        ...sharedViteConfig(env),
        publicDir: "bundled",
        build: {
            rollupOptions: {
                input: {
                    index: path.resolve(__dirname, "./index.html"),
                    command: path.resolve(__dirname, "./command-center.html"),
                    iscriptah: path.resolve(__dirname, "./iscriptah.html"),
                },
            },
            minify: false,
        },

        plugins: [
            react(),
            esmodule(["minipass-fetch", "make-fetch-happen", "libnpmsearch"]),
            electron({

                main: {
                    entry: "./src/main/index.ts",
                    vite: {
                        build: {
                            // For Debug
                            sourcemap: true,
                            outDir: "dist/electron/main",
                            minify: false,

                        },
                        // Will start Electron via VSCode Debug
                        plugins: [process.env.VSCODE_DEBUG ? onstart() : null],

                        ...sharedViteConfig(env),
                    },
                },
                // preload: {
                //     input: {
                //         // You can configure multiple preload here
                //         index: path.join(__dirname, "electron/preload/index.ts"),
                //     },
                //     vite: {
                //         build: {
                //             // For Debug
                //             sourcemap: "inline",
                //             outDir: "dist/electron/preload",
                //         },
                //     },
                // },
                // Enables use of Node.js API in the Renderer-process
                // https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
                renderer: {
                    resolve() {
                        return [
                            "bw-casclib", "events", "util", "fs/promises", "stream", "buffer", "string_decoder", "url", "zlib", "os"
                        ]
                    }
                },
            }),
        ],
        server: process.env.VSCODE_DEBUG ? {
            host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
            port: pkg.debug.env.VITE_DEV_SERVER_PORT,
        } : undefined,
    }
});