import { GrpType, IScriptDATType } from "../types";
import { ImageDAT } from "./images-dat";
import { OrderDAT } from "./orders-dat";
import { LoDAT } from "./parse-lo";
import { SoundDAT } from "./sounds-dat";
import { SpriteDAT } from "./sprites-dat";
import { TechDataDAT } from "./tech-data-dat";
import { UnitDAT } from "./units-dat";
import { UpgradeDAT } from "./upgrades-dat";
import { WeaponDAT } from "./weapons-dat";

export interface BwDAT {
  iscript: IScriptDATType;
  sounds: SoundDAT[];
  tech: TechDataDAT[];
  upgrades: UpgradeDAT[];
  orders: OrderDAT[];
  units: UnitDAT[];
  images: ImageDAT[];
  los: LoDAT[];
  sprites: SpriteDAT[];
  weapons: WeaponDAT[];
  grps: GrpType[];
}
