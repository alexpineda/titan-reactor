export function colorAtMega() {
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

    return tileset.palette.slice(color * 4, color * 4 + 3);
  };
}
