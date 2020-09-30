import parseIscript from "iscript";
import { SoundsDAT } from "./SoundsDAT";
import { SpritesDAT } from "./SpritesDAT";
import { FlingyDAT } from "./FlingyDAT";
import { TechDataDAT } from "./TechDataDAT";
import { UpgradesDAT } from "./UpgradesDAT";
import { OrdersDAT } from "./OrdersDAT";
import { ImagesDAT } from "./ImagesDAT";
import { WeaponsDAT } from "./WeaponsDAT";
import { UnitsDAT } from "./UnitsDAT";
import { openFileBinary, openFileLines, searchFiles } from "../fs";
import { parseLo } from "./parseLo";
import path from "path";

export async function loadAllDataFiles(bwDataPath) {
  const iscript = parseIscript(
    await openFileBinary(`${bwDataPath}/scripts/iscript.bin`)
  );

  const loFiles = await searchFiles(`${bwDataPath}/unit/`, ".lo");
  let los = [];
  for (let loFile of loFiles) {
    const key = loFile.replace(path.join(`${bwDataPath}/unit/`), "");
    los[key] = await parseLo(await openFileBinary(loFile));
  }

  const images = await new ImagesDAT(bwDataPath).load();
  const sprites = await new SpritesDAT(bwDataPath, images).load();
  const flingy = await new FlingyDAT(bwDataPath, sprites).load();
  const weapons = await new WeaponsDAT(bwDataPath, flingy).load();
  const units = await new UnitsDAT(bwDataPath, images, flingy, weapons).load();

  const sounds = await new SoundsDAT(bwDataPath).load();
  const tech = await new TechDataDAT(bwDataPath).load();
  const upgrades = await new UpgradesDAT(bwDataPath).load();
  const orders = await new OrdersDAT(bwDataPath).load();

  return {
    los,
    iscript,
    sounds,
    tech,
    upgrades,
    orders,
    units,
    images,
    weapons,
  };
}
