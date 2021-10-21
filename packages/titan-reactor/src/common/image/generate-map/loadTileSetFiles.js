import readDdsGrp from "../ddsGrp";

const toArrayBuffer = (nodeBuffer) => {
  return new Uint8Array(nodeBuffer).buffer;
};

export default async (readFileFn, chk) => {
  const readFile = async (file, arrayBuffer = true) => {
    const buf = await readFileFn(file);
    return arrayBuffer ? toArrayBuffer(buf) : buf;
  };

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
    mapTiles = new Uint16Array(toArrayBuffer(tiles));
  } else {
    mapTiles = new Uint16Array(toArrayBuffer(chk._tiles));
  }

  const tilesetName = tilesets[tileset];
  const tilegroupArrayBuffer = await readFile(`TileSet/${tilesetName}.cv5`);

  const tilegroupU16 = new Uint16Array(tilegroupArrayBuffer);
  const tilegroupBuf = Buffer.from(tilegroupArrayBuffer);
  const megatiles = new Uint32Array(
    await readFile(`TileSet/${tilesetName}.vx4ex`)
  );
  const minitilesFlags = new Uint16Array(
    await readFile(`TileSet/${tilesetName}.vf4`)
  );
  const minitiles = new Uint8Array(
    await readFile(`TileSet/${tilesetName}.vr4`)
  );
  const palette = new Uint8Array(
    await readFile(`TileSet/${tilesetName}.wpe`)
  ).slice(0, 1024);

  const hdTiles = readDdsGrp(
    await readFile(`TileSet/${tilesetName}.dds.vr4`, false),
    true
  );
  const creepGrpHD = readDdsGrp(
    await readFile(`TileSet/${tilesetName}.dds.grp`, false),
    false
  );
  const creepGrpSD = await readFile(`TileSet/${tilesetName}.grp`, false);

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
