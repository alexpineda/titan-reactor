const casclib = require("casclib");
const { promises } = require("fs");
const { decodeTileGroups, decodeTiles } = require("./decode");
const { loadTilesetFilesAsync } = require("./load-bw-files");
const { exactMatch, scoreMatch } = require("./match");

// a utility to compile a JSON mapping of SCR tiles to BW tiles
// used by MtxmDowngrader
let _storageHandle;
let _lastBwPath;

const readCascFile = (filePath) => {
  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.error("failed loading casc file, retrying open casc");
    casclib.openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};

const openCascStorage = (bwPath) => {
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);

const tilesets = [
  "badlands", // 29 mismatches
  "platform",
  "install",
  "ashworld", // no mismatches
  "jungle", // 63 mismatches
  "desert", // 477 mismatches
  "ice", // 423 mismatches
  "twilight",
];

async function mapTiles(_tileset) {
  const tileset = tilesets[_tileset];

  let tilesSCR, tiles;
  // load SCR tiles, and flip tile flags if flipped = true
  {
    const { megatiles, minitilesU16, tilegroupBuf } =
      await loadTilesetFilesAsync(readCascFile, tileset, true);

    const tileGroups = decodeTileGroups(tilegroupBuf);
    tilesSCR = tileGroups.flatMap((tg) =>
      decodeTiles(tg, megatiles, minitilesU16, true)
    );
  }

  // load BW tiles
  {
    const { megatiles, minitilesU16, tilegroupBuf } =
      await loadTilesetFilesAsync(promises.readFile, tileset);

    const tileGroups = decodeTileGroups(tilegroupBuf);
    tiles = tileGroups.flatMap((tg) =>
      decodeTiles(tg, megatiles, minitilesU16)
    );
  }

  // const scrExclusive = tilesSCR.filter(
  //   (scr) => !tiles.some((bw) => scr.id === bw.id)
  // );
  const scrExclusive = tilesSCR;

  const exactMatches = scrExclusive
    .map((scr) => {
      const bw = tiles.find((bw) => exactMatch(scr, bw));
      if (!bw) {
        return null;
      }
      return [scr, bw];
    })
    .filter((m) => m);

  const failedMatches = scrExclusive.filter(
    ({ id }) => !exactMatches.find(([scr]) => scr.id === id)
  );

  const partialMatches = failedMatches.map((scr) => scoreMatch(scr, tiles));

  const matches = [...exactMatches, ...partialMatches];

  return {
    partial: partialMatches.length,
    matches,
  };
}

const proc = async (bwPath) => {
  const results = [];

  openCascStorage(bwPath);
  for (let i = 0; i < tilesets.length; i++) {
    results[i] = await mapTiles(i);
  }
  closeCascStorage();
  promises.writeFile("./mappings.json", JSON.stringify(results, null, 2));
};
proc(process.argv[2] || "C:\\Program Files (x86)\\StarCraft");
