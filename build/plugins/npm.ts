import search from "libnpmsearch";

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
