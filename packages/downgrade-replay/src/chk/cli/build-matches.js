const fs = require("fs");
const util = require("util");
const { decodeTileGroups, decodeTiles } = require("../matcher/decode");
const { loadTilesetFilesAsync } = require("../matcher/load-bw-files");
const { exactMatch, scoreMatch } = require("../matcher/match");
const { tilesetNames } = require("../common");
const {
  readCascFile,
  closeCascStorage,
  openCascStorage,
} = require("../../util/casc");

const { promises } = fs;
// a utility to compile a JSON mapping of SCR tiles to BW tiles
// used by MtxmDowngrader

async function mapTiles(tileset) {
  console.log(tileset);
  let tilesSCR, tiles, groups, groupsSCR;
  // load SCR tiles, and flip tile flags if flipped = true
  {
    const { megatiles, minitilesU16, tilegroupBuf } =
      await loadTilesetFilesAsync(readCascFile, tileset, true);

    groupsSCR = decodeTileGroups(tilegroupBuf);
    tilesSCR = groupsSCR.flatMap((tg) =>
      decodeTiles(tg, megatiles, minitilesU16, true)
    );
  }

  // load BW tiles
  {
    const { megatiles, minitilesU16, tilegroupBuf } =
      await loadTilesetFilesAsync(promises.readFile, tileset);

    groups = decodeTileGroups(tilegroupBuf);
    tiles = groups.flatMap((tg) => decodeTiles(tg, megatiles, minitilesU16));
  }

  const exactMatches = tilesSCR
    .map((scr) => {
      const bw = tiles.find((bw) => exactMatch(scr, bw));
      if (!bw) {
        return null;
      }
      return [scr, bw];
    })
    .filter((m) => m);

  const failedMatches = tilesSCR.filter(
    ({ id }) => !exactMatches.find(([scr]) => scr.id === id)
  );

  const partialMatches = failedMatches.map((scr) => [
    scr,
    scoreMatch(scr, tiles),
  ]);
  // console.log(
  //   util.inspect(partialMatches, false, null, true /* enable colors */)
  // );
  if (partialMatches.length !== failedMatches.length) {
    throw new Error(
      `partial matches ${partialMatches.length} must equal failed matches ${failedMatches.length}`
    );
  }

  console.log(exactMatches.length, partialMatches.length, tiles.length);
  const matches = [...exactMatches, ...partialMatches];
  return {
    partial: partialMatches.length,
    matches,
  };
}

const proc = async (bwPath) => {
  const results = [];

  openCascStorage(bwPath);

  for (const tileset of tilesetNames) {
    if (tileset === "install") {
      results.push(null);
      continue;
    }
    if (tileset !== "ice") {
      continue;
    }
    const result = await mapTiles(tileset);
    results.push(result);
  }
  closeCascStorage();
  // promises.writeFile("./mappings.json", JSON.stringify(results, null, 2));
};
proc(process.argv[2] || "C:\\Program Files (x86)\\StarCraft");
