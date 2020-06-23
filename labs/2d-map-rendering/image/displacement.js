export const displacement = (opts) =>
  function (tileset) {
    function flip(x, flipped) {
      if (flipped) {
        return 7 - x;
      }
      return x;
    }

    const {
      elevations,
      detailsRatio,
      onlyWalkable,
      skipWalkable,
      skipDetails,
      tint,
      detailsElevations,
      water,
      twilight,
      lava,
    } = opts;

    return (
      mapX,
      mapY,
      miniX,
      miniY,
      px,
      py,
      groupMeta,
      { minitile, flipped, low, mid, high, walkable, blocksView, ramp },
      current
    ) => {
      const color = tileset.minitiles.readUInt8(
        minitile * 0x20 + py * 8 + flip(px, flipped)
      );
      const [r, g, b] = tileset.palette.slice(color * 4, color * 4 + 3);

      let detailsNormal = (r + g + b) / (3 * 255);

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
        detailsNormal = 0;
      }

      if (blocksView) {
        elevation = Math.min(4, elevation + 1);
      }

      let elevationNormal = elevations[elevation];

      if (blocksView) {
        elevationNormal = Math.min(1, elevationNormal * 1.25);
      }

      if (onlyWalkable && !walkable) {
        return current;
      }

      const details = detailsNormal * detailsElevations[elevation];

      if (skipWalkable && walkable && !(mid && high)) {
        const d = details * detailsRatio[elevation] * 255;
        return [0, 0, d];
      }

      let rgb =
        (elevationNormal * (1 - detailsRatio[elevation]) +
          details * detailsRatio[elevation]) *
        255;

      if (water) {
        if (b - r < 12 && b - g < 12) {
          rgb = 255;
        }
      }

      if (lava) {
        if (r > 120 && b < 40 && g < 40) {
          rgb = 255;
        }
      }

      if (twilight) {
        if (g > 160 && b > 160 && r < 160) {
          rgb = 255;
        }
      }

      return [rgb * tint[0], rgb * tint[1], rgb * tint[2]];

      // if (ramp) {
      //   return [127, 127, 127]
      // } else {
      //   return [
      //     mid ? 255 : 0,
      //     walkable ? 255 : 0,
      //     high ? 255 : 0
      //   ]
      // }
    };
  };
