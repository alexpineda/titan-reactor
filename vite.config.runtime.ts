import react from "@vitejs/plugin-react";
import path from "path";
import tsConfig from "./tsconfig.json";
import { sharedViteConfig } from "./vite.shared";
// import mkcert from 'vite-plugin-mkcert'
import { defineConfig } from "vite";

const OUT_DIR = "dist/plugins";
const TARGET = tsConfig.compilerOptions.target;

export default defineConfig({
    ...sharedViteConfig(),
    base: "./",
    logLevel: "info",
    publicDir: "bundled/assets",
    build: {
        outDir: OUT_DIR,
        target: TARGET,
        rollupOptions: {
            input: {
                runtime: path.resolve(__dirname, "./runtime.html"),
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
});
