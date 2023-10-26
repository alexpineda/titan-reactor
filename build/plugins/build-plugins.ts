import sanitizeFilename from "sanitize-filename";
import * as npm from "./npm";
import pacote from "pacote";
import path from "node:path";
import { rmSync } from "fs";

import esbuild from "esbuild";
import { fileExists, useTempDir } from "../files";

import { copyFileSync, writeFileSync, readFileSync } from "fs";

const cwd = process.cwd();
const outDir = path.join(cwd, "dist", "plugins");
// rmSync(outDir, { recursive: true, force: true });
console.log("outDir", outDir);

const external = [
    "@titan-reactor-runtime/ui",
    "@titan-reactor-runtime/host",
    "react",
    "three",
    "camera-controls",
    "react-dom",
    "zustand",
    "react-dom/test-utils",
];

const build = async () => {
    const packages = await npm.searchPackages();

    console.log(packages.officialPackages.length, "official packages found");

    const packageNames = new Set<string>();

    await useTempDir(async (dir) => {
        for (const pkg of packages.officialPackages) {
            const manifest = await pacote.manifest(pkg.name);
            const folderName = sanitizeFilename(manifest.name.replace("/", "_"));
            const sourceFolderPath = path.join(dir, folderName);

            await pacote.extract(pkg.name, sourceFolderPath);

            if (manifest.deprecated) {
                continue;
            }

            const hostFilePath = path.join(sourceFolderPath, "host", "index.ts");
            const uiFilePath = path.join(sourceFolderPath, "ui", "index");

            const files = [
                { path: hostFilePath, type: "host" },
                { path: uiFilePath + ".tsx", type: "ui" },
                { path: uiFilePath + ".jsx", type: "ui" },
            ];

            for (const file of files) {
                if (await fileExists(file.path)) {
                    console.log(file.type + " file found", file);

                    try {
                        const outfile = path.join(
                            outDir,
                            folderName,
                            `${file.type}.js`
                        );

                        await esbuild.build({
                            entryPoints: [file.path],
                            bundle: true,
                            format: "esm",
                            outfile,
                            external,
                            banner: {
                                js:
                                    file.type === "ui"
                                        ? `import { _rc } from "@titan-reactor-runtime/ui"; const registerComponent = (...args) => _rc("${pkg.name}", ...args);`
                                        : "",
                            },
                        });

                        copyFileSync(
                            path.join(sourceFolderPath, "package.json"),
                            path.join(outDir, folderName, "package.json")
                        );

                        packageNames.add(folderName);
                    } catch (error) {
                        console.log("error building", file.path, error);
                    }
                }
            }
        }

        writeFileSync(path.join(outDir, "index.json"), JSON.stringify([...packageNames]));
    });

    //todo: convert to vite build

    const copyFiles = [
        // path.join("bundled", "assets", "conthrax-rg.otf"),
        // path.join("bundled", "assets", "conthrax-hv.otf"),
        // path.join("bundled", "assets", "Inter-VariableFont_slnt,wght.ttf"),
        // path.join("src", "renderer", "plugins", "ui-runtime", "runtime.html"),
    ];

    for (const file of copyFiles) {
        copyFileSync(path.join(cwd, file), path.join(outDir, path.basename(file)));
    }

    // const js = await esbuild.transform(readFileSync(path.join(cwd, "src", "renderer", "plugins", "ui-runtime", "runtime.tsx"), "utf8"));
    // writeFileSync(path.join(outDir, "runtime.js"), js.code);

    // await esbuild.build({
    //     entryPoints: [
    //         path.join(cwd, "src", "renderer", "plugins", "ui-runtime", "runtime.tsx"),
    //     ],
    //     bundle: true,
    //     format: "esm",
    //     outfile: path.join(outDir, "runtime.js"),
    //     external,
    // });
};

build();
