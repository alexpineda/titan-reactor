// utility to create an index of tile downgrades SCR index -> BW index
// requires SCR files
// reference: http://www.staredit.net/wiki/index.php?title=Terrain_Format

const range = require("../../util/range");
const { getCenterAndRadius } = require("./score");
const TILEGROUP_SIZE = 0x34;

const decodeTileGroups = (tilegroupBuf) =>
  range(0, tilegroupBuf.length / TILEGROUP_SIZE).map((i) => {
    const buf = tilegroupBuf.slice(
      i * TILEGROUP_SIZE,
      i * TILEGROUP_SIZE + TILEGROUP_SIZE
    );

    const groupId = buf.readUInt16LE(0);
    const flags = buf.readUInt8(2) & 0xf0;
    const buildable = flags === 0;
    const creep = Boolean(flags & 0x40);
    const unbuildable = Boolean(flags & 0x80);
    const elevation = buf.readUInt8(3) & 0xf;
    const data = buf.slice(20, 20 + 32);
    const tiles = range(0, 16).map((j) => data.readUInt16LE(j * 2));
    const zeroBuf = Buffer.alloc(TILEGROUP_SIZE, 0).compare(buf) === 0;
    const hex = buf.toString("hex");

    return {
      index: i,
      groupId,
      buildable,
      creep,
      unbuildable,
      elevation,
      tiles,
      zeroBuf,
      tileBuf: data,
      hex,
    };
  });

const decodeTiles = (
  {
    tiles,
    groupId,
    index: groupIndex,
    buildable,
    creep,
    unbuildable,
    elevation,
  },
  megatiles,
  minitilesU16,
  flipXInScore = false
) => {
  const _tileCache = [];

  tiles.forEach((id, index) => {
    if (_tileCache[id]) {
      return;
    }
    const megatile = megatiles[id];
    // @todo should I worry about this?
    const flipped = Boolean(megatile & 0x1);

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

      _scores[0].push(meta & 0x1);
      _scores[1].push(meta & 0x02);
      _scores[2].push(meta & 0x04);
      _scores[3].push(meta & 0x08);
    }
    const scores = _scores.map((type) => getCenterAndRadius(type));

    const out = {
      id,
      index,
      flipped,
      groupId,
      groupIndex,
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
    };
    _tileCache[id] = out;
  });

  return _tileCache;
};

module.exports = {
  decodeTileGroups,
  decodeTiles,
};
