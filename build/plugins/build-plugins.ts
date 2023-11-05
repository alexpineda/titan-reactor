import path from "node:path";

import esbuild from "esbuild";
import { fileExists } from "../files";

import { copyFileSync, writeFileSync } from "fs";
import { ExtractedPluginManifest } from "./plugin-manifest";

const cwd = process.cwd();
const outDir = path.join(cwd, "dist", "plugins");

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

type IndexedPackage = {
    rootUrl: string;
    name: string;
    version: string;
    description: string;
    files: string[];
};

export const build = async (repository: Repository) => {
    const { packages, cleanup } = await repository();

    const index = new Map<string, IndexedPackage>();

    for (const { sourceFolderPath, manifest, folderName } of packages) {
        if (manifest.deprecated) {
            continue;
        }
        const hostFilePath = path.join(sourceFolderPath, "src", "index.ts");
        const uiFilePath = path.join(sourceFolderPath, "src", "components", "index");

        const searchFiles = [
            { path: hostFilePath, type: "host.js" },
            { path: uiFilePath + ".tsx", type: "ui.js" },
            { path: uiFilePath + ".jsx", type: "ui.js" },
        ];

        const files: { path: string; type: string }[] = [];

        for (const file of searchFiles) {
            if (await fileExists(file.path)) {
                files.push(file);
            }
        }

        if (files.length === 0) {
            console.warn("no files found for", manifest.name);
            continue;
        }

        const idx = {
            name: manifest.name,
            version: manifest.version,
            description: manifest.description,
            rootUrl: folderName,
            files: [],
        }

        for (const file of files) {
                console.log(file.type + " file found", file);

                try {
                    const outfile = path.join(outDir, folderName, "dist", file.type);

                    await esbuild.build({
                        entryPoints: [file.path],
                        bundle: true,
                        format: "esm",
                        outfile,
                        external,
                        banner: {
                            js:
                                file.type === "ui.js"
                                    ? `import { _rc } from "@titan-reactor-runtime/ui"; const registerComponent = (...args) => _rc("${manifest.name}", ...args);`
                                    : "",
                        },
                    });

                    idx.files.push(file.type);
                } catch (error) {
                    console.error("error building", file.path, error);
                }
            }

            try {
                copyFileSync(
                    path.join(sourceFolderPath, "package.json"),
                    path.join(outDir, folderName, "package.json")
                );

                if (await fileExists(path.join(sourceFolderPath, "readme.md"))) {
                    copyFileSync(
                        path.join(sourceFolderPath, "readme.md"),
                        path.join(outDir, folderName, "readme.md")
                    );
                }
                index.set(manifest.name, idx);
            } catch (error) {
                console.error("error building manifest", error);
            }
        }

    if (cleanup) {
        cleanup();
    }

    const indexJson = {
        indexVersion: 1,
        buildVersion: 0,
        packages: [...index.values()],
    }

    writeFileSync(path.join(outDir, "index.json"), JSON.stringify(indexJson));
};
