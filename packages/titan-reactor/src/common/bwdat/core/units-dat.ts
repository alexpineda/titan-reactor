import range from "../../utils/range";
import { DAT } from "./dat";
import { FlingyDAT } from "./flingy-dat";
import { ImageDAT } from "./images-dat";
import { SoundDAT } from "./sounds-dat";
import { ReadFile } from "../../types";

//eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnitDAT extends UnitDATIncomingType { }
export class UnitDAT implements UnitDAT {
  specialAbilityFlags = 0;
  starEditGroupFlags = 0;
  name = "";

  constructor(data: UnitDATIncomingType) {
    Object.assign(this, data);
  }

  _flag(shift: number) {
    return Boolean(this.specialAbilityFlags & (1 << shift));
  }

  get isBuilding() {
    return Boolean(this.specialAbilityFlags & 1);
  }

  get isAddon() {
    return this._flag(1);
  }

  get isFlyer() {
    return this._flag(2);
  }

  get isResourceMiner() {
    return this._flag(3);
  }

  get isSubunit() {
    return this._flag(4);
  }

  get isFlyingBuilding() {
    return this._flag(5);
  }

  get isHero() {
    return this._flag(6);
  }

  get regenerates() {
    return this._flag(7);
  }

  get animatedIdle() {
    return this._flag(8);
  }

  get cloakable() {
    return this._flag(9);
  }

  get twoUnitsInOneEgg() {
    return this._flag(10);
  }

  get singleEntity() {
    return this._flag(11);
  }

  get isResourceDepot() {
    return this._flag(12);
  }

  get isResourceContainer() {
    return this._flag(13);
  }

  get isRobotic() {
    return this._flag(14);
  }

  get isDetector() {
    return this._flag(15);
  }

  get isOrganic() {
    return this._flag(16);
  }

  get requiresCreep() {
    return this._flag(17);
  }

  get unusedFlag() {
    return this._flag(18);
  }

  get requiresPsi() {
    return this._flag(19);
  }

  get burrowable() {
    return this._flag(20);
  }

  get isSpellcaster() {
    return this._flag(21);
  }

  get permanentCloak() {
    return this._flag(22);
  }

  get pickupItem() {
    return this._flag(23);
  }

  get ignoreSupplyCheck() {
    return this._flag(24);
  }

  get useMediumOverlays() {
    return this._flag(25);
  }

  get useLargeOverlays() {
    return this._flag(26);
  }

  get battleReactions() {
    return this._flag(27);
  }

  get fullAutoAttack() {
    return this._flag(28);
  }

  get invincible() {
    return this._flag(29);
  }

  get isMechanical() {
    return this._flag(30);
  }

  get producesUnits() {
    return this._flag(31);
  }

  _starEditGroupFlag(bit: number) {
    return !!(this.starEditGroupFlags & bit);
  }

  get isZerg() {
    return this._starEditGroupFlag(1);
  }

  get isTerran() {
    return this._starEditGroupFlag(2);
  }

  get isProtoss() {
    return this._starEditGroupFlag(4);
  }
}

export type UnitDATIncomingType = {
  index: number;
  flingy: any;
  subUnit1: number;
  subUnit2: number;
  infestation: number[];
  constructionAnimation: any,
  direction: number;
  shieldsEnabled: boolean;
  shields: number;
  hp: number;
  elevationLevel: number;
  groundWeapon: number;
  airWeapon: number;
  sightRange: number;
  armorUpgrade: number;
  unitSize: number;
  armor: number;

  readySound: string | number;
  whatSound: string[];
  yesSound: string[];
  pissSound: string[];

  whatSoundStart: number;
  whatSoundEnd: number;
  yesSoundStart: number;
  yesSoundEnd: number;
  pissSoundStart: number;
  pissSoundEnd: number;

  placementWidth: number;
  placementHeight: number;
  addonHorizontal: number;
  addonVertical: number;
  unitSizeLeft: number;
  unitSizeUp: number;
  unitSizeRight: number;
  unitSizeDown: number;
  portrait: number;
  mineralCost: number;
  vespeneCost: number;
  buildTime: number;
  requirements: number;
  starEditGroupFlags: number;
  supplyProvided: number;
  supplyRequired: number;
  spaceRequired: number;
  spaceProvided: number;
  buildScore: number;
  destroyScore: number;
  starEditAvailabilityFlags: number;
};

export class UnitsDAT extends DAT<UnitDATIncomingType> {
  sounds: SoundDAT[];

  constructor(
    readFile: ReadFile,
    images: ImageDAT[] = [],
    flingy: FlingyDAT[] = [],
    sounds: SoundDAT[] = []
  ) {
    super(readFile);

    this.format = [
      { size: 1, name: "flingy", get: (i) => flingy[i] },
      { size: 2, name: "subUnit1" },
      { size: 2, name: "subUnit2" },
      {
        size: 2,
        name: "infestation",
        range: () => range(106, 202),
      },
      { size: 4, name: "constructionAnimation", get: (i) => images[i] },
      { size: 1, name: "direction" },
      { size: 1, name: "shieldsEnabled", get: (val) => Boolean(val) },
      { size: 2, name: "shields" },
      { size: 4, name: "hp", get: (value) => value >> 8 },
      {
        size: 1,
        name: "elevationLevel",
      },
      { size: 1, name: "unknown" },
      { size: 1, name: "sublabel" },
      { size: 1, name: "compAIIdleOrder" },
      { size: 1, name: "humanAIIdleOrder" },
      { size: 1, name: "returntoIdleOrder" },
      { size: 1, name: "attackUnitOrder" },
      { size: 1, name: "attackMoveOrder" },
      { size: 1, name: "groundWeapon" },
      { size: 1, name: "maxGroundHits" },
      { size: 1, name: "airWeapon" },
      { size: 1, name: "maxAirHits" },
      { size: 1, name: "aIInternal" },
      { size: 4, name: "specialAbilityFlags" },
      { size: 1, name: "targetAcquisitionRange" },
      { size: 1, name: "sightRange" },
      { size: 1, name: "armorUpgrade" },
      { size: 1, name: "unitSize" },
      { size: 1, name: "armor" },
      { size: 1, name: "rightClickAction" },
      {
        size: 2,
        name: "readySound",
        range: () => range(0, 106),
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
        names: ["placementWidth", "placementHeight"],
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
      { size: 2, name: "portrait" },
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
    this.count = 228;
    this.sounds = sounds;
  }

  override post(entries: UnitDATIncomingType[]) {
    return entries.map((entry: UnitDATIncomingType, i: number) => {
      const loadSounds = (
        start: keyof UnitDATIncomingType,
        end: keyof UnitDATIncomingType
      ): string[] => {
        if (entry[start] && entry[end]) {
          return range(0, entry[end] - entry[start]).map((s) => this.sounds[s + entry[start]].file);
        }
        return [];
      };

      return {
        ...entry,
        whatSound: loadSounds(
          "whatSoundStart" as keyof UnitDATIncomingType,
          "whatSoundEnd" as keyof UnitDATIncomingType
        ),
        pissSound: loadSounds(
          "pissSoundStart" as keyof UnitDATIncomingType,
          "pissSoundEnd" as keyof UnitDATIncomingType
        ),
        yesSound: loadSounds(
          "yesSoundStart" as keyof UnitDATIncomingType,
          "yesSoundEnd" as keyof UnitDATIncomingType
        ),

        readySound: this.sounds[entry.readySound as number].file,
        name: this.stats[i],
        index: i,
      };
    });
  }
}
