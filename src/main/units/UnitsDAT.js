import { range } from "ramda";
import { DAT } from "./DAT";

//@todo use reductions?
const reductions = {
  7: 0.25, // SCV
  41: 0.25, // Drone
  64: 0.25, // Probe

  13: 0.0, // Spider Mine
  73: 0.0, // Interceptor
  85: 0.0, // Scarab

  32: 2.0, // Firebat
  43: 2.0, // Mutalisk
  65: 2.0, // Zealot

  47: 1 / 16.0, // Scourge
  50: 1 / 16.0, // Infested Terran

  83: 0.1, // Reaver
};

export class UnitsDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.format = [
      { size: 1, name: "Graphics", get: this._datValue("Flingy") },
      { size: 2, name: "Subunit1", get: this._datValue("Units") },
      { size: 2, name: "Subunit2", get: this._datValue("Units") },
      {
        size: 2,
        name: "Infestation",
        get: this._datValue("Units"),
        range: () => range(106, 202),
      },
      { size: 4, name: "ConstructionAnimation", get: this._datValue("Images") },
      { size: 1, name: "UnitDirection" },
      { size: 1, name: "ShieldEnable" },
      { size: 2, name: "ShieldAmount" },
      { size: 4, name: "HitPoints", get: (value) => value >> 8 },
      {
        size: 1,
        name: "ElevationLevel",
        get: this._infoValue("ElevationLevels"),
      },
      { size: 1, name: "Unknown" },
      { size: 1, name: "Sublabel" },
      { size: 1, name: "CompAIIdle", get: this._datValue("Orders") },
      { size: 1, name: "HumanAIIdle", get: this._datValue("Orders") },
      { size: 1, name: "ReturntoIdle", get: this._datValue("Orders") },
      { size: 1, name: "AttackUnit", get: this._datValue("Orders") },
      { size: 1, name: "AttackMove", get: this._datValue("Orders") },
      { size: 1, name: "GroundWeapon", get: this._datValue("Weapons") },
      { size: 1, name: "MaxGroundHits" },
      { size: 1, name: "AirWeapon", get: this._datValue("Weapons") },
      { size: 1, name: "MaxAirHits" },
      { size: 1, name: "AIInternal" },
      { size: 4, name: "SpecialAbilityFlags" },
      { size: 1, name: "TargetAcquisitionRange" },
      { size: 1, name: "SightRange" },
      { size: 1, name: "ArmorUpgrade", get: this._datValue("Upgrades") },
      { size: 1, name: "UnitSize", get: this._infoValue("UnitSize") },
      { size: 1, name: "Armor" },
      { size: 1, name: "RightClickAction", get: this._infoValue("Rightclick") },
      {
        size: 2,
        name: "ReadySound",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      { size: 2, name: "WhatSoundStart", get: this._datValue("Sfxdata") },
      { size: 2, name: "WhatSoundEnd", get: this._datValue("Sfxdata") },
      {
        size: 2,
        name: "PissSoundStart",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      {
        size: 2,
        name: "PissSoundEnd",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      {
        size: 2,
        name: "YesSoundStart",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      {
        size: 2,
        name: "YesSoundEnd",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      {
        size: 4,
        names: ["StarEditPlacementBoxWidth", "StarEditPlacementBoxHeight"],
      },
      {
        size: 4,
        names: ["AddonHorizontal", "AddonVertical"],
        range: () => range(106, 202),
      },
      {
        size: 8,
        names: ["UnitSizeLeft", "UnitSizeUp", "UnitSizeRight", "UnitSizeDown"],
      },
      { size: 2, name: "Portrait", get: this._datValue("Portdata") },
      { size: 2, name: "MineralCost" },
      { size: 2, name: "VespeneCost" },
      { size: 2, name: "BuildTime" },
      { size: 2, name: "Requirements" },
      { size: 1, name: "StarEditGroupFlags" },
      { size: 1, name: "SupplyProvided" },
      { size: 1, name: "SupplyRequired" },
      { size: 1, name: "SpaceRequired" },
      { size: 1, name: "SpaceProvided" },
      { size: 2, name: "BuildScore" },
      { size: 2, name: "DestroyScore" },
      { size: 2, name: "UnitMapString" },
      { size: 1, name: "BroodwarUnitFlag" },
      { size: 2, name: "StarEditAvailabilityFlags" },
    ];

    this.datname = "units.dat";
    this.idfile = "Units.txt";
    this.filesize = 19876;
    this.count = 228;
  }
}
