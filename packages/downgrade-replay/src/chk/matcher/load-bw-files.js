// load tileset files

const loadTilesetFilesAsync = async (openFile, tileset, extended) => {
  const fpath = extended ? "TileSet/" : "./test/tileset/";
  const vx4 = extended ? "vx4ex" : "vx4";

  const tilegroupBuf = await openFile(`${fpath}${tileset}.cv5`);

  const megatileData = await openFile(`${fpath}${tileset}.${vx4}`);
  const megatiles = extended
    ? new Uint32Array(
        megatileData.buffer,
        megatileData.byteOffset,
        megatileData.byteLength / 4
      )
    : new Uint16Array(
        megatileData.buffer,
        megatileData.byteOffset,
        megatileData.byteLength / 2
      );

  const minitilesBuf = await openFile(`${fpath}${tileset}.vf4`);
  const minitilesU16 = new Uint16Array(
    minitilesBuf.buffer,
    minitilesBuf.byteOffset,
    minitilesBuf.byteLength / 2
  );

  return {
    megatiles,
    minitilesU16,
    tilegroupBuf,
  };
};

module.exports = {
  loadTilesetFilesAsync,
};
