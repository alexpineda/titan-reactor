const R = require("ramda");

const concat = require("concat-stream");
const commands = {
  "Keep Alive": 0x05,
  "Save Game": 0x06,
  "Load Game": 0x07,
  "Restart Game": 0x08,
  Select: 0x09,
  "Select Add": 0x0a,
  "Select Remove": 0x0b,
  Build: 0x0c,
  Vision: 0x0d,
  Alliance: 0x0e,
  "Game Speed": 0x0f,
  Pause: 0x10,
  Resume: 0x11,
  Cheat: 0x12,
  Hotkey: 0x13,
  "Right Click": 0x14,
  "Targeted Order": 0x15,
  "Cancel Build": 0x18,
  "Cancel Morph": 0x19,
  Stop: 0x1a,
  "Carrier Stop": 0x1b,
  "Reaver Stop": 0x1c,
  "Order Nothing": 0x1d,
  "Return Cargo": 0x1e,
  Train: 0x1f,
  "Cancel Train": 0x20,
  Cloak: 0x21,
  Decloak: 0x22,
  "Unit Morph": 0x23,
  Unsiege: 0x25,
  Siege: 0x26,
  "Train Fighter": 0x27, // Build interceptor / scarab
  "Unload All": 0x28,
  Unload: 0x29,
  "Merge Archon": 0x2a,
  "Hold Position": 0x2b,
  Burrow: 0x2c,
  Unburrow: 0x2d,
  "Cancel Nuke": 0x2e,
  "Lift Off": 0x2f,
  Tech: 0x30,
  "Cancel Tech": 0x31,
  Upgrade: 0x32,
  "Cancel Upgrade": 0x33,
  "Cancel Addon": 0x34,
  "Building Morph": 0x35,
  Stim: 0x36,
  Sync: 0x37,
  "Voice Enable": 0x38,
  "Voice Disable": 0x39,
  "Voice Squelch": 0x3a,
  "Voice Unsquelch": 0x3b,
  "[Lobby] Start Game": 0x3c,
  "[Lobby] Download Percentage": 0x3d,
  "[Lobby] Change Game Slot": 0x3e,
  "[Lobby] New Net Player": 0x3f,
  "[Lobby] Joined Game": 0x40,
  "[Lobby] Change Race": 0x41,
  "[Lobby] Team Game Team": 0x42,
  "[Lobby] UMS Team": 0x43,
  "[Lobby] Melee Team": 0x44,
  "[Lobby] Swap Players": 0x45,
  "[Lobby] Saved Data": 0x48,
  "Briefing Start": 0x54,
  Latency: 0x55,
  "Replay Speed": 0x56,
  "Leave Game": 0x57,
  "Minimap Ping": 0x58,
  "Merge Dark Archon": 0x5a,
  "Make Game Public": 0x5b,
  Chat: 0x5c,
  "Right Click 1.21": 0x60,
  "Targeted Order 1.21": 0x61,
  "Unload 1.21": 0x62,
  "Select 1.21": 0x63,
  "Select Add 1.21": 0x64,
  "Select Remove 1.21": 0x65,
};

const orders = {
  Die: 0x00,
  Stop: 0x01,
  Guard: 0x02,
  PlayerGuard: 0x03,
  TurretGuard: 0x04,
  BunkerGuard: 0x05,
  Move: 0x06,
  ReaverStop: 0x07,
  Attack1: 0x08,
  Attack2: 0x09,
  AttackUnit: 0x0a,
  AttackFixedRange: 0x0b,
  AttackTile: 0x0c,
  Hover: 0x0d,
  AttackMove: 0x0e,
  InfestedCommandCenter: 0x0f,
  UnusedNothing: 0x10,
  UnusedPowerup: 0x11,
  TowerGuard: 0x12,
  TowerAttack: 0x13,
  VultureMine: 0x14,
  StayInRange: 0x15,
  TurretAttack: 0x16,
  Nothing: 0x17,
  Unused_24: 0x18,
  DroneStartBuild: 0x19,
  DroneBuild: 0x1a,
  CastInfestation: 0x1b,
  MoveToInfest: 0x1c,
  InfestingCommandCenter: 0x1d,
  PlaceBuilding: 0x1e,
  PlaceProtossBuilding: 0x1f,
  CreateProtossBuilding: 0x20,
  ConstructingBuilding: 0x21,
  Repair: 0x22,
  MoveToRepair: 0x23,
  PlaceAddon: 0x24,
  BuildAddon: 0x25,
  Train: 0x26,
  RallyPointUnit: 0x27,
  RallyPointTile: 0x28,
  ZergBirth: 0x29,
  ZergUnitMorph: 0x2a,
  ZergBuildingMorph: 0x2b,
  IncompleteBuilding: 0x2c,
  IncompleteMorphing: 0x2d,
  BuildNydusExit: 0x2e,
  EnterNydusCanal: 0x2f,
  IncompleteWarping: 0x30,
  Follow: 0x31,
  Carrier: 0x32,
  ReaverCarrierMove: 0x33,
  CarrierStop: 0x34,
  CarrierAttack: 0x35,
  CarrierMoveToAttack: 0x36,
  CarrierIgnore2: 0x37,
  CarrierFight: 0x38,
  CarrierHoldPosition: 0x39,
  Reaver: 0x3a,
  ReaverAttack: 0x3b,
  ReaverMoveToAttack: 0x3c,
  ReaverFight: 0x3d,
  ReaverHoldPosition: 0x3e,
  TrainFighter: 0x3f,
  InterceptorAttack: 0x40,
  ScarabAttack: 0x41,
  RechargeShieldsUnit: 0x42,
  RechargeShieldsBattery: 0x43,
  ShieldBattery: 0x44,
  InterceptorReturn: 0x45,
  DroneLand: 0x46,
  BuildingLand: 0x47,
  BuildingLiftOff: 0x48,
  DroneLiftOff: 0x49,
  LiftingOff: 0x4a,
  ResearchTech: 0x4b,
  Upgrade: 0x4c,
  Larva: 0x4d,
  SpawningLarva: 0x4e,
  Harvest1: 0x4f,
  Harvest2: 0x50,
  MoveToGas: 0x51,
  WaitForGas: 0x52,
  HarvestGas: 0x53,
  ReturnGas: 0x54,
  MoveToMinerals: 0x55,
  WaitForMinerals: 0x56,
  MiningMinerals: 0x57,
  Harvest3: 0x58,
  Harvest4: 0x59,
  ReturnMinerals: 0x5a,
  Interrupted: 0x5b,
  EnterTransport: 0x5c,
  PickupIdle: 0x5d,
  PickupTransport: 0x5e,
  PickupBunker: 0x5f,
  Pickup4: 0x60,
  PowerupIdle: 0x61,
  Sieging: 0x62,
  Unsieging: 0x63,
  WatchTarget: 0x64,
  InitCreepGrowth: 0x65,
  SpreadCreep: 0x66,
  StoppingCreepGrowth: 0x67,
  GuardianAspect: 0x68,
  ArchonWarp: 0x69,
  CompletingArchonSummon: 0x6a,
  HoldPosition: 0x6b,
  QueenHoldPosition: 0x6c,
  Cloak: 0x6d,
  Decloak: 0x6e,
  Unload: 0x6f,
  MoveUnload: 0x70,
  FireYamatoGun: 0x71,
  MoveToFireYamatoGun: 0x72,
  CastLockdown: 0x73,
  Burrowing: 0x74,
  Burrowed: 0x75,
  Unburrowing: 0x76,
  CastDarkSwarm: 0x77,
  CastParasite: 0x78,
  CastSpawnBroodlings: 0x79,
  CastEMPShockwave: 0x7a,
  NukeWait: 0x7b,
  NukeTrain: 0x7c,
  NukeLaunch: 0x7d,
  NukePaint: 0x7e,
  NukeUnit: 0x7f,
  CastNuclearStrike: 0x80,
  NukeTrack: 0x81,
  InitializeArbiter: 0x82,
  CloakNearbyUnits: 0x83,
  PlaceMine: 0x84,
  RightClickAction: 0x85,
  SuicideUnit: 0x86,
  SuicideLocation: 0x87,
  SuicideHoldPosition: 0x88,
  CastRecall: 0x89,
  Teleport: 0x8a,
  CastScannerSweep: 0x8b,
  Scanner: 0x8c,
  CastDefensiveMatrix: 0x8d,
  CastPsionicStorm: 0x8e,
  CastIrradiate: 0x8f,
  CastPlague: 0x90,
  CastConsume: 0x91,
  CastEnsnare: 0x92,
  CastStasisField: 0x93,
  CastHallucination: 0x94,
  Hallucination2: 0x95,
  ResetCollision: 0x96,
  ResetHarvestCollision: 0x97,
  Patrol: 0x98,
  CTFCOPInit: 0x99,
  CTFCOPStarted: 0x9a,
  CTFCOP2: 0x9b,
  ComputerAI: 0x9c,
  AtkMoveEP: 0x9d,
  HarassMove: 0x9e,
  AIPatrol: 0x9f,
  GuardPost: 0xa0,
  RescuePassive: 0xa1,
  Neutral: 0xa2,
  ComputerReturn: 0xa3,
  InitializePsiProvider: 0xa4,
  SelfDestructing: 0xa5,
  Critter: 0xa6,
  HiddenGun: 0xa7,
  OpenDoor: 0xa8,
  CloseDoor: 0xa9,
  HideTrap: 0xaa,
  RevealTrap: 0xab,
  EnableDoodad: 0xac,
  DisableDoodad: 0xad,
  WarpIn: 0xae,
  Medic: 0xaf,
  MedicHeal: 0xb0,
  HealMove: 0xb1,
  MedicHoldPosition: 0xb2,
  MedicHealToIdle: 0xb3,
  CastRestoration: 0xb4,
  CastDisruptionWeb: 0xb5,
  CastMindControl: 0xb6,
  DarkArchonMeld: 0xb7,
  CastFeedback: 0xb8,
  CastOpticalFlare: 0xb9,
  CastMaelstrom: 0xba,
  JunkYardDog: 0xbb,
  Fatal: 0xbc,
  None: 0xbd,
};

const utils = {
  unitTag: (uint16) => uint16 & 0x7ff,
  unitTagIsValid: (uint16) => uint16 != 0xffff,
  unitTagRecycle: (uint16) => uint16 >> 12,
  hotkeyTypes: {
    0x00: "Assign",
    0x01: "Select",
    0x02: "Add",
  },
};

const getOrderName = (id) => R.invertObj(orders)[id];

export const cmdToJson = function ({ type: { name } }, buffer) {
  //todo use id in signature
  const data = new Buffer(buffer);
  switch (name) {
    case "Right Click":
      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag: utils.unitTag(data.readUInt16LE(4)),
        unit: data.readUInt16LE(6),
        queued: data.readUInt8(8) != 0,
      };
    case "Select":
    case "Select Add":
    case "Select Remove":
      const count = data.readUInt8(0);
      const unitTags = [];

      for (let i = 0; i < count; i += 2) {
        //todo verify these values are accurate
        //seems like they are 1/2 values
        unitTags.push(utils.unitTag(data.readUInt16LE(1 + i)));
      }

      return {
        unitTags,
      };
    case "Hotkey":
      return {
        hotkeyType: data.readUInt8(0),
        group: data.readUInt8(1),
      };
    case "Train":
    case "Unit Morph":
      return {
        unit: data.readUInt16LE(0),
      };
    case "Targeted Order":
      return {
        x: data.readUInt16LE(0),
        y: data.readUInt16LE(2),
        unitTag: utils.unitTag(data.readUInt16LE(4)),
        unit: data.readUInt16LE(6),
        order: {
          name: getOrderName(data.readUInt8(8)),
          id: data.readUInt8(8),
        },
        queued: data.readUInt8(9) != 0,
      };
    case "Build":
      return {
        order: {
          name: getOrderName(data.readUInt8(0)),
          id: data.readUInt8(0),
        },
        x: data.readUInt16LE(1),
        y: data.readUInt16LE(3),
        unit: data.readUInt16LE(5),
      };
    case "Stop":
    case "Burrow":
    case "Unburrow":
    case "Return Cargo":
    case "Hold Position":
    case "Unload All":
    case "Unsiege":
    case "Siege":
    case "Cloak":
    case "Decloak":
      return {
        queued: data.readUInt8(0) != 0,
      };

    case "Cancel Train":
      return {
        unitTag: utils.unitTag(data.readInt16LE(0)),
      };
    case "Lift Off":
      return {
        x: data.readInt16LE(0),
        y: data.readInt16LE(2),
      };

    case "Tech":
      return {
        tech: data.readUInt8(0),
      };
    case "Upgrade":
      return {
        upgrade: data.readUInt8(0),
      };
    case "Building Morph":
      return {
        unit: data.readUInt16LE(0),
      };
    default:
      return null;
  }

  // skipped: vision, alliance, gamespeed, UNLOAD, cheat, latency, savegame, chat, minimap ping,
};
