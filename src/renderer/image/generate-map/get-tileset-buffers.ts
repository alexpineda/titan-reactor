import { readCascFile } from "@utils/casclib";
import { TilesetBuffers } from "common/types";

export const getTilesetBuffers = async (
  tileset: number,
  tilesBuffer: Buffer
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
  //hitchhiker has odd length buffer
  if (tilesBuffer.buffer.byteLength % 2 === 1) {
    const tiles = Buffer.alloc(tilesBuffer.byteLength + 1);
    tilesBuffer.copy(tiles);
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
  const tilegroupU16 = new Uint16Array((await readCascFile(`TileSet/${tilesetName}.cv5`)).buffer);

  const megatilesVX4 = new Uint32Array(
    (await readCascFile(`TileSet/${tilesetName}.vx4ex`)).buffer
  );
  const minitilesFlagsVF4 = new Uint16Array(
    (await readCascFile(`TileSet/${tilesetName}.vf4`)).buffer
  );
  const minitilesVR4 = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.vr4`)).buffer
  );
  const paletteWPE = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.wpe`)).buffer
  ).slice(0, 1024);

  let hdTiles, creepGrpHD;

  const creepGrpSD = await readCascFile(`TileSet/${tilesetName}.grp`);

  hdTiles = await readCascFile(`TileSet/${tilesetName}.dds.vr4`);
  creepGrpHD =
    await readCascFile(`TileSet/${tilesetName}.dds.grp`);

  const waterNormal1 = await readCascFile(`effect/water_normal_1.dds.grp`);
  const waterNormal2 = await readCascFile(`effect/water_normal_2.dds.grp`);
  const noise = await readCascFile(`effect/noise.DDS`);

  const waterMask = await readCascFile(`TileSet/${tilesetName}_mask.dds.grp`);
  const tileMask = await readCascFile(`TileSet/${tilesetName}.tmsk`);

  return {
    mapTiles,
    megatilesVX4,
    minitilesFlagsVF4,
    minitilesVR4,
    paletteWPE,
    tileset,
    hdTiles,
    tilegroupCV5: tilegroupU16,
    creepGrpSD,
    creepGrpHD,
    waterMask,
    waterNormal1,
    waterNormal2,
    noise,
    tileMask
  };
};
