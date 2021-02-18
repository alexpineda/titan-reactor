import ContiguousContainer from "./ContiguousContainer";

// status_flag_completed = 1,
// 		status_flag_grounded_building = 2,
// 		status_flag_flying = 4,
// 		status_flag_8 = 8,
// 		status_flag_burrowed = 0x10,
// 		status_flag_in_bunker = 0x20,
// 		status_flag_loaded = 0x40,

// 		status_flag_requires_detector = 0x100,
// 		status_flag_cloaked = 0x200,
// 		status_flag_disabled = 0x400,
// 		status_flag_passively_cloaked = 0x800,
// 		status_flag_order_not_interruptible = 0x1000,
// 		status_flag_iscript_nobrk = 0x2000,
// 		status_flag_4000 = 0x4000,
// 		status_flag_cannot_attack = 0x8000,
// 		status_flag_can_turn = 0x10000,
// 		status_flag_can_move = 0x20000,
// 		status_flag_collision = 0x40000,
// 		status_flag_immovable = 0x80000,
// 		status_flag_ground_unit = 0x100000,
// 		status_flag_no_collide = 0x200000,
// 		status_flag_400000 = 0x400000,
// 		status_flag_gathering = 0x800000,
// 		status_flag_turret_walking = 0x1000000,

// 		status_flag_invincible = 0x4000000,
// 		status_flag_ready_to_attack = 0x8000000,

// 		status_flag_speed_upgrade = 0x10000000,
// 		status_flag_cooldown_upgrade = 0x20000000,
// 		status_flag_hallucination = 0x40000000,
// 		status_flag_lifetime_expired = 0x80000000,

const flags = Object.freeze({
  flying: 4,
});

export default class UnitsBW extends ContiguousContainer {
  static get byteLength() {
    return 48;
  }

  constructor(bwDat) {
    super();
    this.bwDat = bwDat;
  }

  get default() {
    return this.index;
  }

  get index() {
    return this._readU32(0);
  }

  get id() {
    return this._read32(4);
  }

  get owner() {
    return this._read32(8);
  }

  get x() {
    return this._read32(12);
  }

  get y() {
    return this._read32(16);
  }

  get hp() {
    return this._read32(20);
  }

  get energy() {
    return this._read32(24);
  }

  get spriteIndex() {
    return this._read32(28);
  }

  get statusFlags() {
    return this._read32(32);
  }

  get direction() {
    return this._read32(36);
  }

  get angle() {
    return this._readDouble(40);
  }

  get unitType() {
    return this.bwDat.units[this.id];
  }

  get isFlying() {
    return (this.statusFlags & flags.flying) != 0;
  }
}
