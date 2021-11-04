const groupMatch = (scr, bw) => {
  const mismatches = [];
  if (scr.index !== bw.index) {
    mismatches.push(`index: ${scr.index} !== ${bw.index}`);
  }
  if (scr.buildable !== bw.buildable) {
    mismatches.push(`buildable: ${scr.buildable} !== ${bw.buildable}`);
  }
  if (scr.unbuildable !== bw.unbuildable) {
    mismatches.push(`unbuildable: ${scr.unbuildable} !== ${bw.unbuildable}`);
  }
  if (scr.elevation !== bw.elevation) {
    mismatches.push(`elevation: ${scr.elevation} !== ${bw.elevation}`);
  }
  if (scr.elevation !== bw.elevation) {
    mismatches.push(`elevation: ${scr.elevation} !== ${bw.elevation}`);
  }
  return [
    scr.index === bw.index &&
      scr.buildable === bw.buildable &&
      scr.creep === bw.creep &&
      scr.unbuildable === bw.unbuildable &&
      scr.elevation === bw.elevation &&
      scr.tileBuf.compare(bw.tileBuf) === 0,
    mismatches,
  ];
  //@todo test tiles in group
};

const exactMatch = (scr, bw) => {
  // ignoring flipped vx4 flag
  return (
    bw.walkable === scr.walkable &&
    bw.mid === scr.mid &&
    bw.high === scr.high &&
    bw.buildable === scr.buildable &&
    bw.unbuildable === scr.unbuildable &&
    bw.elevation === scr.elevation &&
    bw.creep === scr.creep &&
    bw.blocksView === scr.blocksView
  );
};

// @todo test all flipped bw tiles the other way as well?
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

  const test = bwTiles
    // must be an exact match on tilegroup cv5 flags as well as blocks view vr4 flags
    .filter(
      (bwTile) =>
        bwTile.creep === scr.creep &&
        bwTile.blocksView === scr.blocksView &&
        scr.buildable === bwTile.buildable &&
        scr.unbuildable === bwTile.unbuildable &&
        scr.elevation === bwTile.elevation
    );

  const nearest = bwTiles
    // must be an exact match on tilegroup cv5 flags as well as blocks view vr4 flags
    .filter(
      (bwTile) =>
        bwTile.creep === scr.creep &&
        bwTile.blocksView === scr.blocksView &&
        scr.buildable === bwTile.buildable &&
        scr.unbuildable === bwTile.unbuildable &&
        scr.elevation === bwTile.elevation
    )
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
      { scoreFlags: 999, invalid: true }
    );

  if (nearest.invalid) {
    throw new Error("no partial match was found");
  }
  return nearest;
};

module.exports = {
  exactMatch,
  scoreMatch,
  groupMatch,
};
