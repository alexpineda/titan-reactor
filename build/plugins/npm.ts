import search from "libnpmsearch";
import pacote from "pacote";
import path from "node:path";
import sanitizeFilename from "sanitize-filename";

const LIMIT = 1000;
const SEARCH_KEYWORDS = "keywords:titan-reactor-plugin";
const SEARCH_OFFICIAL = "@titan-reactor-plugins";

export const searchPackages = async () => {
    const officialPackages = await search(SEARCH_OFFICIAL, {
        limit: LIMIT,
    });

    const publicPackages = (
        await search(SEARCH_KEYWORDS, {
            limit: LIMIT,
        })
    ).filter((pkg) => !officialPackages.some((p) => p.name === pkg.name));

    return { officialPackages, publicPackages };
};

/**
 * Build packages for distribution in production
 * @param dir string
 */
// export const buildPackages = async (dir) => {
// const packages = await searchPackages();

// for (const package of packages.officialPackages) {
//     const manifest = await pacote.manifest( package.name );
//     const folderName = sanitizeFilename( manifest.name.replace( "/", "_" ) );
//     const folderPath = path.join( dir, folderName );

//     await pacote.extract( package.name, folderPath );

//     try {
//         const loadedPackage = await this.#loadPluginPackage(
//             folderPath,
//             folderName
//         );
// }
// }
