import { IScriptBIN } from "./IScriptBIN";
import { SoundsDAT } from "./SoundsDAT";
import { PortraitsDAT } from "./PortraitsDAT";
import { SpritesDAT } from "./SpritesDAT";
import { FlingyDAT } from "./FlingyDAT";
import { TechDataDAT } from "./TechDataDAT";
import { UpgradesDAT } from "./UpgradesDAT";
import { OrdersDAT } from "./OrdersDAT";
import { ImagesDAT } from "./ImagesDAT";
import { WeaponsDAT } from "./WeaponsDAT";
import { UnitsDAT } from "./UnitsDAT";

export function loadAllDataFiles(bwDataPath) {
  const data = [
    new IScriptBIN(bwDataPath),
    new SoundsDAT(bwDataPath),
    new SpritesDAT(bwDataPath),
    new FlingyDAT(bwDataPath),
    new TechDataDAT(bwDataPath),
    new UpgradesDAT(bwDataPath),
    new OrdersDAT(bwDataPath),
    new ImagesDAT(bwDataPath),
    new WeaponsDAT(bwDataPath),
    new UnitsDAT(bwDataPath),
  ];

  return Promise.all(data.map((d) => d.load())).then(
    ([
      iscript,
      sounds,
      sprites,
      flingy,
      tech,
      upgrades,
      orders,
      images,
      weapons,
      units,
    ]) => {
      const result = {
        iscript,
        sounds,
        sprites,
        flingy,
        tech,
        upgrades,
        orders,
        images,
        weapons,
        units,
      };
      return result;
    }
  );
}
