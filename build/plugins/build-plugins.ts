import sanitizeFilename from "sanitize-filename";
import * as npm from "./npm";
import pacote from "pacote";
import path from "node:path";

import esbuild from "esbuild";
import { fileExists } from "../files";

import { copyFileSync, writeFileSync } from "fs";
import { getLocalRepositoryManifests } from "./local-repository";
import { ExtractedPluginManifest } from "./plugin-manifest";

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

type Repository = () => Promise<{
    packages: ExtractedPluginManifest[];
    cleanup?: () => void;
}>;

export const build = async (repository: Repository) => {
    const { packages, cleanup } = await repository();

    const packageNames = new Set<string>();

    for (const { sourceFolderPath, manifest, folderName } of packages) {
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
                    const outfile = path.join(outDir, folderName, `${file.type}.js`);

                    await esbuild.build({
                        entryPoints: [file.path],
                        bundle: true,
                        format: "esm",
                        outfile,
                        external,
                        banner: {
                            js:
                                file.type === "ui"
                                    ? `import { _rc } from "@titan-reactor-runtime/ui"; const registerComponent = (...args) => _rc("${manifest.name}", ...args);`
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

    if (cleanup) {
        cleanup();
    }

    writeFileSync(path.join(outDir, "index.json"), JSON.stringify([...packageNames]));
};