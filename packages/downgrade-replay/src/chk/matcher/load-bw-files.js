// load tileset files

const loadTilesetFilesAsync = async (openFile, tileset, extended) => {
  const fpath = extended ? "TileSet/" : "./test/tileset/";
  const vx4 = extended ? "vx4ex" : "vx4";

  const tilegroupBuf = await openFile(`${fpath}${tileset}.cv5`);

  const megatileData = await openFile(`${fpath}${tileset}.${vx4}`);
  const megatiles = extended
    ? new Uint32Array(megatileData)
    : new Uint16Array(megatileData);

  const minitilesU16 = new Uint16Array(
    await openFile(`${fpath}${tileset}.vf4`)
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
