import { IScriptBIN } from "./IScriptBIN";
import { SoundsDAT } from "./SoundsDAT";
import { SpritesDAT } from "./SpritesDAT";
import { FlingyDAT } from "./FlingyDAT";
import { TechDataDAT } from "./TechDataDAT";
import { UpgradesDAT } from "./UpgradesDAT";
import { OrdersDAT } from "./OrdersDAT";
import { ImagesDAT } from "./ImagesDAT";
import { WeaponsDAT } from "./WeaponsDAT";
import { UnitsDAT } from "./UnitsDAT";

export async function loadAllDataFiles(bwDataPath) {
  const iscript = await new IScriptBIN(bwDataPath).load();
  const images = await new ImagesDAT(bwDataPath, iscript).load();
  const sprites = await new SpritesDAT(bwDataPath, images).load();
  const flingy = await new FlingyDAT(bwDataPath, sprites).load();
  const weapons = await new WeaponsDAT(bwDataPath, flingy).load();
  const units = await new UnitsDAT(bwDataPath, images, flingy, weapons).load();

  const sounds = await new SoundsDAT(bwDataPath).load();
  const tech = await new TechDataDAT(bwDataPath).load();
  const upgrades = await new UpgradesDAT(bwDataPath).load();
  const orders = await new OrdersDAT(bwDataPath).load();

  return {
    iscript,
    sounds,
    tech,
    upgrades,
    orders,
    units,
  };
}
