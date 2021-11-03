const exactMatch = (scr, bw) => {
  return (
    bw.id === scr.id ||
    (bw.flipped === scr.flipped &&
      bw.walkable === scr.walkable &&
      bw.mid === scr.mid &&
      bw.high === scr.high &&
      bw.buildable === scr.buildable &&
      bw.unbuildable === scr.unbuildable &&
      bw.elevation === scr.elevation &&
      !bw.creep &&
      !bw.blocksView)
  );
};

// @todo test all flipped bw tiles the other way as well?
// @todo include tilegroup flags in search, expand search based on priority
const scoreMatch = (scr, bwTiles) => {
  // equally weighted amongst all flags
  const flags = ["walkable", "mid", "high"];
  const scoreFlags = (flag, bwTile) => {
    if (scr[flag] === bwTile[flag]) {
      return 0;
    } else {
      const distance = Math.sqrt(
        (Math.abs(scr.scores[flag][0] - bwTile.scores[flag][0]) ^ 2) +
          (Math.abs(scr.scores[flag][1] - bwTile.scores[flag][1]) ^ 2)
      );
      const rad = Math.abs(scr.scores[flag][2] - bwTile.scores[flag][2]);
      return distance + rad;
    }
  };

  const nearest = bwTiles
    .filter((bwTile) => !bwTile.creep && !bwTile.blocksView)
    .reduce(
      (nearest, bwTile) => {
        const score = flags.reduce(
          (acc, flag) => acc + scoreFlags(flag, bwTile),
          0
        );
        if (score < nearest.scoreFlags) {
          return {
            ...bwTile,
            scoreFlags: score,
          };
        } else {
          return nearest;
        }
      },
      { scoreFlags: 999 }
    );

  return [scr, nearest];
};

module.exports = {
  exactMatch,
  scoreMatch,
};
