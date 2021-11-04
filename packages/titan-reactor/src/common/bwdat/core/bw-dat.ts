import { GrpType } from "../../types/grp";
import { ImageDATType } from "./images-dat";
import { IScriptDATType } from "./iscript";
import { OrderDATType } from "./orders-dat";
import { LoDATType } from "./parse-lo";
import { SoundDATType } from "./sounds-dat";
import { SpriteDATType } from "./sprites-dat";
import { TechDataDATType } from "./tech-data-dat";
import { UnitDAT } from "./units-dat";
import { UpgradeDATType } from "./upgrades-dat";
import { WeaponDATType } from "./weapons-dat";

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