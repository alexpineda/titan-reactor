export function defaultRender(tileset) {
  return (
    mapX,
    mapY,
    miniX,
    miniY,
    px,
    py,
    groupMeta,
    { minitile, flipped }
  ) => {
    let color = 0;
    if (flipped) {
      color = tileset.minitiles.readUInt8(minitile * 0x20 + py * 8 + (7 - px));
    } else {
      color = tileset.minitiles.readUInt8(minitile * 0x20 + py * 8 + px);
    }

    return tileset.palette.slice(color * 4, color * 4 + 3);
  };
}
