import { GrpType, IScriptDATType } from "../../types";
import { ImageDAT } from "./images-dat";
import { OrderDAT } from "./orders-dat";
import { LoDAT } from "./parse-lo";
import { SoundDAT } from "./sounds-dat";
import { SpriteDATType } from "./sprites-dat";
import { TechDataDATType } from "./tech-data-dat";
import { UnitDAT } from "./units-dat";
import { UpgradeDATType } from "./upgrades-dat";
import { WeaponDAT } from "./weapons-dat";

export interface BwDAT {
  iscript: IScriptDATType;
  sounds: SoundDAT[];
  tech: TechDataDATType[];
  upgrades: UpgradeDATType[];
  orders: OrderDAT[];
  units: UnitDAT[];
  images: ImageDAT[];
  los: LoDAT[];
  sprites: SpriteDATType[];
  weapons: WeaponDAT[];
  grps: GrpType[];
}
