import { readCascFile } from "common/casclib";

// platform, install
const noWaterMasks = [1, 2];

export type TilesetData = Awaited<ReturnType<typeof loadAllTilesetData>>;

export const loadAllTilesetData = async (
  tileset: number
) => {
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


  const tilesetName = tilesets[tileset];
  const tilegroupsCV5 = new Uint16Array((await readCascFile(`TileSet/${tilesetName}.cv5`)).buffer);

  const megatilesVX4 = new Uint32Array(
    (await readCascFile(`TileSet/${tilesetName}.vx4ex`)).buffer
  );
  const minitilesFlagsVF4 = new Uint16Array(
    (await readCascFile(`TileSet/${tilesetName}.vf4`)).buffer
  );
  const minitilesVR4 = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.vr4`)).buffer
  );
  const palette = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.wpe`)).buffer
  ).slice(0, 1024);

  const creepGrpSD = await readCascFile(`TileSet/${tilesetName}.grp`);

  const hdTiles = await readCascFile(`TileSet/${tilesetName}.dds.vr4`);
  const creepGrpHD =
    await readCascFile(`TileSet/${tilesetName}.dds.grp`);

  const waterNormal1 = await readCascFile("effect/water_normal_1.dds.grp");
  const waterNormal2 = await readCascFile("effect/water_normal_2.dds.grp");
  const noise = await readCascFile("effect/noise.DDS");

  const waterMask = noWaterMasks.includes(tileset) ? null : await readCascFile(`TileSet/${tilesetName}_mask.dds.grp`);
  const tileMask = noWaterMasks.includes(tileset) ? null : await readCascFile(`TileSet/${tilesetName}.tmsk`);

  return {
    megatilesVX4,
    minitilesFlagsVF4,
    minitilesVR4,
    palette,
    hdTiles,
    tilegroupsCV5,
    creepGrpSD,
    creepGrpHD,
    waterMask,
    waterNormal1,
    waterNormal2,
    noise,
    tileMask
  };
};
