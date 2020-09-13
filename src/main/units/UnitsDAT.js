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
  constructor(bwDataPath, images = {}, flingy = {}, weapons = {}) {
    super(bwDataPath);

    this.format = [
      { size: 1, name: "flingy", get: (i) => flingy[i] },
      { size: 2, name: "subUnit1", get: this._datValue("Units") },
      { size: 2, name: "subUnit2", get: this._datValue("Units") },
      {
        size: 2,
        name: "infestation",
        get: this._datValue("Units"),
        range: () => range(106, 202),
      },
      { size: 4, name: "constructionAnimation", get: (i) => images[i] },
      { size: 1, name: "direction" },
      { size: 1, name: "shieldsEnabled" },
      { size: 2, name: "shields" },
      { size: 4, name: "hp", get: (value) => value >> 8 },
      {
        size: 1,
        name: "elevationLevel",
        get: this._infoValue("ElevationLevels"),
      },
      { size: 1, name: "unknown" },
      { size: 1, name: "sublabel" },
      { size: 1, name: "compAIIdle", get: this._datValue("Orders") },
      { size: 1, name: "humanAIIdle", get: this._datValue("Orders") },
      { size: 1, name: "returntoIdle", get: this._datValue("Orders") },
      { size: 1, name: "attackUnit", get: this._datValue("Orders") },
      { size: 1, name: "attackMove", get: this._datValue("Orders") },
      { size: 1, name: "groundWeapon", get: (i) => weapons[i] },
      { size: 1, name: "maxGroundHits" },
      { size: 1, name: "airWeapon", get: (i) => weapons[i] },
      { size: 1, name: "maxAirHits" },
      { size: 1, name: "aIInternal" },
      { size: 4, name: "specialAbilityFlags" },
      { size: 1, name: "targetAcquisitionRange" },
      { size: 1, name: "sightRange" },
      { size: 1, name: "armorUpgrade", get: this._datValue("Upgrades") },
      { size: 1, name: "unitSize", get: this._infoValue("UnitSize") },
      { size: 1, name: "armor" },
      { size: 1, name: "rightClickAction", get: this._infoValue("Rightclick") },
      {
        size: 2,
        name: "readySound",
        range: () => range(0, 106),
        get: this._datValue("Sfxdata"),
      },
      { size: 2, name: "whatSoundStart" },
      { size: 2, name: "whatSoundEnd" },
      {
        size: 2,
        name: "pissSoundStart",
        range: () => range(0, 106),
      },
      {
        size: 2,
        name: "pissSoundEnd",
        range: () => range(0, 106),
      },
      {
        size: 2,
        name: "yesSoundStart",
        range: () => range(0, 106),
      },
      {
        size: 2,
        name: "yesSoundEnd",
        range: () => range(0, 106),
      },
      {
        size: 4,
        names: ["starEditPlacementBoxWidth", "starEditPlacementBoxHeight"],
      },
      {
        size: 4,
        names: ["addonHorizontal", "addonVertical"],
        range: () => range(106, 202),
      },
      {
        size: 8,
        names: ["unitSizeLeft", "unitSizeUp", "unitSizeRight", "unitSizeDown"],
      },
      { size: 2, name: "portrait", get: this._datValue("Portdata") },
      { size: 2, name: "mineralCost" },
      { size: 2, name: "vespeneCost" },
      { size: 2, name: "buildTime" },
      { size: 2, name: "requirements" },
      { size: 1, name: "starEditGroupFlags" },
      { size: 1, name: "supplyProvided" },
      { size: 1, name: "supplyRequired" },
      { size: 1, name: "spaceRequired" },
      { size: 1, name: "spaceProvided" },
      { size: 2, name: "buildScore" },
      { size: 2, name: "destroyScore" },
      { size: 2, name: "unitMapString" },
      { size: 1, name: "broodwarUnitFlag" },
      { size: 2, name: "starEditAvailabilityFlags" },
    ];

    this.datname = "units.dat";
    this.idfile = "Units.txt";
    this.filesize = 19876;
    this.count = 228;
  }

  post(entries) {
    return entries.map((entry, i) => {
      const loadSounds = (start, end, label) => {
        if (entry[start] && entry[end]) {
          entry[label] = range(0, entry[end] - entry[start]).map((s) =>
            this._datValue("Sfxdata")(s + entry[start])
          );
          delete entry[start];
          delete entry[end];
        }
      };

      loadSounds("whatSoundStart", "whatSoundEnd", "whatSound");
      loadSounds("pissSoundStart", "pissSoundEnd", "pissSound");
      loadSounds("yesSoundStart", "yesSoundEnd", "yesSound");

      entry.name = this._datValue("Units")(i);
    });
  }
}
