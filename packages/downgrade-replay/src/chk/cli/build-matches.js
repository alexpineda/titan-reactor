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

const DEBUG_TILESET = null;

async function mapTiles(tileset) {
  const bwData = await loadTilesetFilesAsync(promises.readFile, tileset);
  const bwGroups = decodeTileGroups(bwData.tilegroupBuf);
  const bwTiles = bwGroups.flatMap((tg) =>
    decodeTiles(tg, bwData.megatiles, bwData.minitilesU16)
  );

  const scrData = await loadTilesetFilesAsync(readCascFile, tileset, true);
  const scrGroups = decodeTileGroups(Buffer.from(scrData.tilegroupBuf)).slice(
    bwGroups.length + 1
  );
  const scrTiles = scrGroups.flatMap((tg) =>
    decodeTiles(tg, scrData.megatiles, scrData.minitilesU16, true)
  );

  const tilesToMatch = scrTiles.filter(
    (scr) => !bwTiles.find(({ id }) => scr.id === id)
  );

  const match = (scr) => {
    const exact = bwTiles.find((bw) => exactMatch(scr, bw));
    if (exact) {
      return { ...exact, exact: true };
    }
    return {
      ...scoreMatch(scr, bwTiles),
      partial: true,
    };
  };
  const matches = tilesToMatch.map((scr) => [scr, match(scr)]);

  if (DEBUG_TILESET) {
    debugger;
  }

  return {
    matches: matches.map(([scr, bw]) => [
      (scr.group << 4) | (scr.index & 0xf),
      (bw.group << 4) | (bw.index & 0xf),
    ]),
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
    if (DEBUG_TILESET && tileset !== DEBUG_TILESET) {
      continue;
    }
    const result = await mapTiles(tileset);
    console.log(tileset, result.matches.length);
    results.push(result);
  }
  closeCascStorage();
  !DEBUG_TILESET &&
    promises.writeFile("./matches.json", JSON.stringify(results, null, 2));
  console.log("complete");
};
proc(process.argv[2] || "C:\\Program Files (x86)\\StarCraft");
