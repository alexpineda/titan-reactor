import sanitizeFilename from "sanitize-filename";
import * as npm from "./npm";
import pacote from "pacote";
import path from "node:path";
import { useTempDir } from "../files";

export const getNpmRepositoryManifests = async () => {
    const packages = await npm.searchPackages();

    console.log(packages.officialPackages.length, "official packages found");

    const { dir, cleanup } = await useTempDir();

    for (const pkg of packages.officialPackages) {
        const packageName = pkg.name;
        const isDeprecated = (await pacote.manifest(packageName)).deprecated;
        const folderName = sanitizeFilename(packageName.replace("/", "_"));
        const sourceFolderPath = path.join(dir, folderName);

        await pacote.extract(packageName, sourceFolderPath);

        if (isDeprecated) {
            continue;
        }
    }

    return { packages, cleanup };
};
