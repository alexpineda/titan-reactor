export function colorAtMega({ renderElevations } = {}) {
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
    const flipped = mini & 1;

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
    const meta = tileset.megatilesMeta.readUInt16LE(
      mega * 0x20 + (miniY * 4 + miniX) * 2
    );

    const walkable = meta & 0x01;
    const mid = meta & 0x02;
    const high = meta & 0x04;
    const blocksView = meta & 0x08;

    if (renderElevations) {
      if (blocksView) {
        return [224, 224, 224];
      } else if (high && walkable && mid) {
        return [192, 192, 192];
      } else if (high && walkable) {
        return [160, 160, 160];
      } else if (high) {
        return [128, 128, 128];
      } else if (mid && walkable) {
        return [96, 96, 96];
      } else if (mid) {
        return [64, 64, 64];
      } else if (walkable) {
        return [32, 32, 32];
      } else {
        return [0, 0, 0];
      }
    }

    return tileset.palette.slice(color * 4, color * 4 + 3);
  };
}
