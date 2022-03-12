import { AssetTextureResolution, TilesetBuffers } from "../../common/types";

export const loadTilesetFiles = async (
  readFileFn: (filename: string) => Promise<Buffer>,
  tileset: number,
  tilesBuffer: Buffer,
  terrainTextureResolution: AssetTextureResolution
): Promise<TilesetBuffers> => {
  const tilesets = [
    "badlands",
    "platform",
    "install",
    "ashworld",
    "jungle",
    "desert",
    "ice",
    "twilight",
  ];

  let mapTiles;
  //hitchhiker has odd length buffer??
  if (tilesBuffer.buffer.byteLength % 2 === 1) {
    const tiles = Buffer.alloc(tilesBuffer.byteLength + 1);
    tilesBuffer.copy(tiles);
    // mapTiles = new Uint16Array(tiles.buffer);
    mapTiles = new Uint16Array(
      tiles.buffer,
      tiles.byteOffset,
      tiles.byteLength / Uint16Array.BYTES_PER_ELEMENT
    );
  } else {

    mapTiles = new Uint16Array(
      tilesBuffer.buffer,
      tilesBuffer.byteOffset,
      tilesBuffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
    );

  }

  const tilesetName = tilesets[tileset];
  const tilegroupBuf = await readFileFn(`TileSet/${tilesetName}.cv5`);
  const tilegroupU16 = new Uint16Array(tilegroupBuf.buffer);

  const megatiles = new Uint32Array(
    (await readFileFn(`TileSet/${tilesetName}.vx4ex`)).buffer
  );
  const minitilesFlags = new Uint16Array(
    (await readFileFn(`TileSet/${tilesetName}.vf4`)).buffer
  );
  const minitiles = new Uint8Array(
    (await readFileFn(`TileSet/${tilesetName}.vr4`)).buffer
  );
  const palette = new Uint8Array(
    (await readFileFn(`TileSet/${tilesetName}.wpe`)).buffer
  ).slice(0, 1024);

  let hdTiles, creepGrpHD, creepGrpSD;

  if (terrainTextureResolution === AssetTextureResolution.SD) {
    creepGrpSD = await readFileFn(`TileSet/${tilesetName}.grp`);
  } else if (terrainTextureResolution === AssetTextureResolution.HD2) {
    hdTiles = await readFileFn(`HD2/TileSet/${tilesetName}.dds.vr4`)

    creepGrpHD =
      await readFileFn(`HD2/TileSet/${tilesetName}.dds.grp`)

  } else {
    hdTiles =
      await readFileFn(`TileSet/${tilesetName}.dds.vr4`)
    creepGrpHD =
      await readFileFn(`TileSet/${tilesetName}.dds.grp`)

  }



  // const warpInGrpHD = MapHD.renderWarpIn(
  //   renderer,
  //   readDdsGrp(await readFile("anim/main_210.anim", false), false)
  // );

  // const warpInGrpSD = readDdsGrp(
  //   await readFile(`anim/main_210.anim`, false),
  //   false
  // );

  return {
    mapTiles,
    megatiles,
    minitilesFlags,
    minitiles,
    palette,
    tileset,
    hdTiles,
    tilegroupU16,
    tilegroupBuf,
    creepGrpSD,
    creepGrpHD,
  };
};
