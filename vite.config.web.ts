import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";
import path from "path";
import tsConfig from "./tsconfig.json";
import { sharedViteConfig } from "./vite.shared";
// import mkcert from 'vite-plugin-mkcert'

const OUT_DIR = "dist/web";
const TARGET = tsConfig.compilerOptions.target;

// https://vitejs.dev/config/
export default defineConfig((env) => {
    console.log(env);
    return {
        ...sharedViteConfig(),
        // titan-reactor is the subfolder in the black-sheep-wall public dir
        base: env.command === "build" ? "/titan-reactor" : "/",
        define: {
            __static: JSON.stringify(
                env.command === "build" ? "/resources/bundled" : "/bundled"
            ),
        },
        logLevel: "info",
        publicDir: "bundled",
        build: {
            emptyOutDir: true,
            outDir: OUT_DIR,
            target: TARGET,
            rollupOptions: {
                input: {
                    command: path.resolve(__dirname, "./configuration.html"),
                    index: path.resolve(__dirname, "./index.html"),
                },
            },
            minify: false, //env.command === "build",
            sourcemap: false, //env.command === "build",
        },
        esbuild: {
            target: TARGET,
            format: "esm",
        },

        worker: {
            format: "es",
        },
        plugins: [react()],
        server: {
            host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
            port: pkg.debug.env.VITE_DEV_SERVER_PORT,
            //   https: true,
            hmr: false,
        },
    };
});
