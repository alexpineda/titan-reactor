import { GrpType } from "../../types/grp";
import { ImageDATType } from "./ImagesDAT";
import { IScriptDATType } from "./IScript";
import { OrderDATType } from "./OrdersDAT";
import { LoDATType } from "./parseLo";
import { SoundDATType } from "./SoundsDAT";
import { SpriteDATType } from "./SpritesDAT";
import { TechDataDATType } from "./TechDataDAT";
import { UnitDAT } from "./UnitsDAT";
import { UpgradeDATType } from "./UpgradesDAT";
import { WeaponDATType } from "./WeaponsDAT";

export type BwDATType = {
  iscript: IScriptDATType;
  sounds: SoundDATType[];
  tech: TechDataDATType[];
  upgrades: UpgradeDATType[];
  orders: OrderDATType[];
  units: UnitDAT[];
  images: ImageDATType[];
  los: LoDATType[];
  sprites: SpriteDATType[];
  weapons: WeaponDATType[];
  grps: GrpType[];
};

export class BwDAT implements BwDATType {
  iscript: IScriptDATType;
  sounds: SoundDATType[];
  tech: TechDataDATType[];
  upgrades: UpgradeDATType[];
  orders: OrderDATType[];
  units: UnitDAT[];
  images: ImageDATType[];
  los: LoDATType[];
  sprites: SpriteDATType[];
  weapons: WeaponDATType[];
  grps: GrpType[];

  constructor(
    iscript: IScriptDATType,
    sounds: SoundDATType[],
    tech: TechDataDATType[],
    upgrades: UpgradeDATType[],
    orders: OrderDATType[],
    units: UnitDAT[],
    images: ImageDATType[],
    los: LoDATType[],
    sprites: SpriteDATType[],
    weapons: WeaponDATType[],
    grps: GrpType[]
  ) {
    this.iscript = iscript;
    this.sounds = sounds;
    this.tech = tech;
    this.upgrades = upgrades;
    this.orders = orders;
    this.units = units;
    this.images = images;
    this.los = los;
    this.sprites = sprites;
    this.weapons = weapons;
    this.grps = grps;
  }
}
