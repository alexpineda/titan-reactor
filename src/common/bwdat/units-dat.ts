import range from "../utils/range";
import { DAT } from "./dat";
import { FlingyDAT } from "./flingy-dat";
import { ImageDAT } from "./images-dat";
import { SoundDAT } from "./sounds-dat";
import { ReadFile } from "../types";

//eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnitDAT extends UnitDATIncomingType { }
export class UnitDAT implements UnitDAT {
  specialAbilityFlags = 0;
  starEditGroupFlags = 0;
  name = "";

  isBuilding: boolean;
  isAddon: boolean;
  isFlyer: boolean;
  isResourceMiner: boolean;
  isTurret: boolean;
  isFlyingBuilding: boolean;
  isHero: boolean;
  regenerates: boolean;
  animatedIdle: boolean;
  cloakable: boolean;
  twoUnitsInOneEgg: boolean;
  singleEntity: boolean;
  isResourceDepot: boolean;
  isResourceContainer: boolean;
  isRobotic: boolean;
  isDetector: boolean;
  isOrganic: boolean;
  requiresCreep: boolean;
  unusedFlag: boolean;
  requiresPsi: boolean;
  burrowable: boolean;
  isSpellcaster: boolean;
  permanentCloak: boolean;
  pickupItem: boolean;
  ignoreSupplyCheck: boolean;
  useMediumOverlays: boolean;
  useLargeOverlays: boolean;
  battleReactions: boolean;
  fullAutoAttack: boolean;
  invincible: boolean;
  isMechanical: boolean;
  producesUnits: boolean;

  isZerg: boolean;
  isTerran: boolean;
  isProtoss: boolean;

  constructor(data: UnitDATIncomingType) {
    Object.assign(this, data);

    const flag = (shift: number) => {
      return (this.specialAbilityFlags & (1 << shift)) !== 0;
    }

    const starEditGroupFlag = (bit: number) => {
      return !!(this.starEditGroupFlags & bit);
    }

    this.isBuilding = flag(0);
    this.isAddon = flag(1);
    this.isFlyer = flag(2);
    this.isResourceMiner = flag(3);
    this.isTurret = flag(4);
    this.isFlyingBuilding = flag(5);
    this.isHero = flag(6);
    this.regenerates = flag(7);
    this.animatedIdle = flag(8);
    this.cloakable = flag(9);
    this.twoUnitsInOneEgg = flag(10);
    this.singleEntity = flag(11);
    this.isResourceDepot = flag(12);
    this.isResourceContainer = flag(13);
    this.isRobotic = flag(14);
    this.isDetector = flag(15);
    this.isOrganic = flag(16);
    this.requiresCreep = flag(17);
    this.unusedFlag = flag(18);
    this.requiresPsi = flag(19);
    this.burrowable = flag(20);
    this.isSpellcaster = flag(21);
    this.permanentCloak = flag(22);
    this.pickupItem = flag(23);
    this.ignoreSupplyCheck = flag(24);
    this.useMediumOverlays = flag(25);
    this.useLargeOverlays = flag(26);
    this.battleReactions = flag(27);
    this.fullAutoAttack = flag(28);
    this.invincible = flag(29);
    this.isMechanical = flag(30);
    this.producesUnits = flag(31);

    this.isZerg = starEditGroupFlag(1);
    this.isTerran = starEditGroupFlag(2);
    this.isProtoss = starEditGroupFlag(4);
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

  readySound: number;
  whatSound: number[];
  yesSound: number[];
  pissSound: number[];

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
      ): number[] => {
        if (entry[start] && entry[end]) {
          return range(0, (entry[end] - entry[start]) + 1).map((s) => s + entry[start]);
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

        name: this.stats[i],
        index: i,
      };
    });
  }
}
