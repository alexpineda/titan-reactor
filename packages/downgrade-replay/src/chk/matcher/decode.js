// utility to create an index of tile downgrades SCR index -> BW index
// requires SCR files
// reference: http://www.staredit.net/wiki/index.php?title=Terrain_Format
// also thanks to Freakling for additional insight on how to improve matching

const range = require("../../util/range");
const { getCenterAndRadius } = require("./score");
const TILEGROUP_SIZE = 0x34;

/**
0x1 flag_walkable, 0x4 flag_unwalkable – True vaules need to be calculated from detile flags! basically just inverse of each other. Need to be matched to ensure pathfinding is preserved.
0x10 flag_provides_cover – Very gameplay relevant, so needs to be matched.
0x40 flag_has_creep – Self-explanatory what this is for. It's set for the Creep tile line in the palette and needs to be avoided, as all Creep tiles have funky properties with regards to walkability and buildability.
0x80 flag_unbuildable – The short answer is: Match. The long is that effectively unbuildable terrain is often achieved by interspersing some unbuildable tiles on otherwise buildable ground, so feel free to figure out how to automate being fancy.
0x100 flag_very_high –  True vaules need to be calculated from detile flags!  Actually this is just the vision blocking flag, and you should match it for consistent gameplay (so, as far as ramps go, just ignore tiles that have it)
0x200 flag_middle – True vaules need to be calculated from detile flags! Needs to be matched to preserve pathfinding
0x400 flag_high – True vaules need to be calculated from detile flags! Needs to be matched to preserve pathfinding
0x4000 flag_temporary_creep – ScmD lists it in its originally intended, deprecated function: "Flipped Sprite". The problem is that there are still the old presets in the tilesets, but that also makes them interact weirdly with Creep (the exact mechanism I am not quite sure about). The bottom line is that you should avoid using these for anything. 

 */
const decodeTileGroups = (tilegroupBuf) => {
  const groups = range(0, tilegroupBuf.length / TILEGROUP_SIZE).map((i) => {
    const buf = tilegroupBuf.slice(
      i * TILEGROUP_SIZE,
      i * TILEGROUP_SIZE + TILEGROUP_SIZE
    );

    const isDoodad = i >= 1024;
    const flags = buf.readUInt8(2) & 0xf0;
    const buildable = flags === 0;
    const creep = Boolean(flags & 0x40);
    const unbuildable = Boolean(flags & 0x80);

    // @todo remove? deprecated? derived?
    const elevation = buf.readUInt8(3) & 0xf;

    const doodad = isDoodad
      ? {
          isDoodad: true,
          doodad: {
            overlayFlipped: buf.readUInt8(3) & 0x4,
            overlayId: buf.readUInt16LE(4),
            width: buf.readUInt16LE(16),
            height: buf.readUInt16LE(18),
          },
        }
      : {
          isDoodad: false,
        };

    const data = buf.slice(20, 20 + 32);
    const tiles = range(0, 16).map((j) => data.readUInt16LE(j * 2));
    const zeroBuf = Buffer.alloc(TILEGROUP_SIZE, 0).compare(buf) === 0;
    const emptyTileCount = tiles.reduce(
      (acc, tile) => (tile === 0 ? acc + 1 : acc),
      0
    );
    const hex = buf.toString("hex");

    return {
      ...doodad,
      group: i,
      buildable,
      creep,
      unbuildable,
      elevation,
      tiles,
      emptyTileCount,
      zeroBuf,
      tileBuf: data,
      hex,
      buf,
    };
  });
  const lastIndex = groups.reduce(
    (acc, group, i) => (!group.zeroBuf ? i : acc),
    0
  );
  return groups.slice(0, lastIndex);
};

const decodeTiles = (
  { tiles, group, buildable, creep, unbuildable, elevation },
  megatiles,
  minitilesU16,
  flipXInScore = false
) => {
  const _tileCache = [];

  tiles.forEach((id, index) => {
    if (_tileCache[id]) {
      return;
    }
    const flipped = Boolean(megatiles[id] & 0x1);

    let walkable = 0;
    let mid = 0;
    let high = 0;
    let blocksView = 0;

    const _scores = [[], [], [], []];
    for (let m = 0; m < 16; m++) {
      const meta = minitilesU16[id * 16 + m];
      walkable = walkable | ((meta & 0x1) << (15 - m));
      mid = mid | ((meta & 0x02 ? 1 : 0) << (15 - m));
      high = high | ((meta & 0x04 ? 1 : 0) << (15 - m));
      blocksView = blocksView | ((meta & 0x08 ? 1 : 0) << (15 - m));

      _scores[0].push(meta & 0x1 ? 1 : 0);
      _scores[1].push(meta & 0x02 ? 1 : 0);
      _scores[2].push(meta & 0x04 ? 1 : 0);
      _scores[3].push(meta & 0x08 ? 1 : 0);
    }
    const scores = _scores.map((type) => getCenterAndRadius(type));

    const totalWalkable = _scores[0].reduce((acc, v) => acc + v, 0);
    const totalMediumGround = _scores[1].reduce((acc, v) => acc + v, 0);
    const totalHighGround = _scores[2].reduce((acc, v) => acc + v, 0);
    const derivedInGame = {
      walkable: totalWalkable > 3,
      unwalkable: totalWalkable <= 3,
      partiallyWalkable: totalWalkable < _scores.length,
      mediumGround: totalHighGround + totalMediumGround >= 12,
      highGround: totalHighGround >= 12,
      visionBlocker: Boolean(blocksView),
    };

    const out = {
      id,
      index,
      flipped,
      group,
      walkable,
      mid,
      high,
      blocksView,
      buildable,
      creep,
      unbuildable,
      elevation,
      scores: {
        walkable: scores[0],
        mid: scores[1],
        high: scores[2],
        blocksView: scores[3],
      },
      derivedInGame,
    };
    _tileCache[id] = out;
  });

  return _tileCache;
};

module.exports = {
  decodeTileGroups,
  decodeTiles,
};
