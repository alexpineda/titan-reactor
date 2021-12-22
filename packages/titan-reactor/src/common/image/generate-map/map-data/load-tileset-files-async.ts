import { ChkType, DDSGrpFrameType } from "../../../types";
import parseDdsGrp, { parseDdsGrpWithFrameData } from "../../formats/parse-dds-grp";

export type TileSetData = {
  mapTiles: Uint16Array;
  megatiles: Uint32Array;
  minitilesFlags: Uint16Array;
  minitiles: Uint8Array;
  palette: Uint8Array;
  tileset: number;
  hdTiles: Buffer[];
  tilegroupU16: Uint16Array;
  tilegroupBuf: Buffer;
  creepGrpSD: Buffer;
  creepGrpHD: DDSGrpFrameType[];
};
export const loadTilesetFilesAsync = async (
  readFileFn: (filename: string) => Promise<Buffer>,
  chk: ChkType
): Promise<TileSetData> => {
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

  const tileset = chk.tileset;

  let mapTiles;
  //hitchhiker has odd length buffer??
  if (chk._tiles.byteLength % 2 === 1) {
    const tiles = Buffer.alloc(chk._tiles.byteLength + 1);
    chk._tiles.copy(tiles);
    mapTiles = new Uint16Array(tiles.buffer);
  } else {
    mapTiles = new Uint16Array(chk._tiles.buffer);
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

  const hdTiles = parseDdsGrp(
    await readFileFn(`TileSet/${tilesetName}.dds.vr4`)
  );
  const creepGrpHD = parseDdsGrpWithFrameData(
    await readFileFn(`TileSet/${tilesetName}.dds.grp`)
  );
  const creepGrpSD = await readFileFn(`TileSet/${tilesetName}.grp`);

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
