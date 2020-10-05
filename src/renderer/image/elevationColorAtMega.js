export const elevationColorAtMega = ({
  elevations,
  detailsRatio,
  onlyWalkable,
  skipWalkable,
  skipDetails,
  water,
  twilight,
  lava,
  colorReplace,
} = {}) => {
  return (tileset, mega, x, y) => {
    const miniX = Math.floor(x / 8);
    const miniY = Math.floor(y / 8);
    const colorX = Math.floor(x % 8);
    const colorY = Math.floor(y % 8);
    let mini = null,
      minitile = null;

    if (tileset.isExtended) {
      mini = tileset.megatiles.readUInt32LE(
        mega * 0x40 + (miniY * 4 + miniX) * 4
      );
      minitile = mini & 0xfffffffe;
    } else {
      mini = tileset.megatiles.readUInt16LE(
        mega * 0x20 + (miniY * 4 + miniX) * 2
      );
      minitile = mini & 0xfffe;
    }
    const meta = tileset.megatilesMeta.readUInt16LE(
      mega * 0x20 + (miniY * 4 + miniX) * 2
    );

    const flipped = mini & 1;
    const walkable = meta & 0x01;
    const mid = meta & 0x02;
    const high = meta & 0x04;
    const blocksView = meta & 0x08;

    let color = 0;
    if (flipped) {
      color = tileset.minitiles.readUInt8(
        minitile * 0x20 + colorY * 8 + (7 - colorX)
      );
    } else {
      color = tileset.minitiles.readUInt8(
        minitile * 0x20 + colorY * 8 + colorX
      );
    }

    const [r, g, b] = tileset.palette.slice(color * 4, color * 4 + 3);

    let details = (r + g + b) / (3 * 255);

    let elevation = 0;

    if (high && walkable && mid) {
      elevation = 6;
    } else if (high && walkable) {
      elevation = 5;
    } else if (high) {
      elevation = 4;
    } else if (mid && walkable) {
      elevation = 3;
    } else if (mid) {
      elevation = 2;
    } else if (walkable) {
      elevation = 1;
    }

    if (skipDetails) {
      details = 0;
    }

    // if (blocksView) {
    //   elevation = Math.min(4, elevation + 1);
    // }

    let elevationNormal = elevations[elevation];

    // if (blocksView) {
    //   elevationNormal = Math.min(1, elevationNormal * 1.25);
    // }

    if (onlyWalkable && !walkable) {
      return [0, 0, 0];
    }

    if (skipWalkable && walkable && !(mid && high)) {
      const d = details * detailsRatio[elevation] * 255;
      return [0, 0, d];
    }

    let rgb =
      (elevationNormal * (1 - detailsRatio[elevation]) +
        details * detailsRatio[elevation]) *
      255;

    //color difference
    if (water) {
      if (b - r < 12 && b - g < 12) {
        rgb = 255;
      }
    }
    //abs(r-g) < 12 b-g < 12  abs(r-g) < 0

    // color range
    if (lava) {
      if (r > 120 && b < 40 && g < 40) {
        rgb = 255;
      }
    }
    //r-b <80, r-g <80, g-b<

    //color replace r,g,b 0.5 1
    //
    if (twilight) {
      if (g > 160 && b > 160 && r < 160) {
        rgb = 255;
      }
    }

    return [rgb, rgb, rgb];
  };
};
