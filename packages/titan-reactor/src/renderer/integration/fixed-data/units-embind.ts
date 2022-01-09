import { unitTypes } from "../../../common/bwdat/enums";
import { BwDAT, UnitDAT } from "../../../common/types/bwdat";
import BufferView from "./buffer-view";
import { UnitRAW } from "../unit-raw";
import { EntityIterator } from "./entity-iterator";

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
  completed: 1,
  groundedBuilding: 2,
  flying: 4,
  loaded: 0x40,
  cloaked: 0x200,
  passivelyCloaked: 0x800,
  canTurn: 0x10000,
  canMove: 0x20000,
});


// get dat(): UnitDAT {
//   return (this.bwDat as BwDAT).units[this.typeId];
// }

// get remainingBuildTime() {
//   if (this.dat.isResourceContainer && this.isComplete) {
//     return 0;
//   }
//   return this._read(22);
// }

// get resourceAmount() {
//   if (this.dat.isResourceContainer && this.isComplete) {
//     // remainingBuildTime
//     return this._read(22);
//   }
//   return null;
// }

export const UNIT_BYTE_LENGTH = 30;
// all units in a bw frame
export class UnitsEmbind implements EntityIterator<UnitRAW> {
    embindUnits = [];

    *items(count = this.embindUnits.length) {
        for (let i = 0; i < count; i++) {
            yield this.embindUnits[i];
        }
    }

    *reverse(count = this.embindUnits.length) {
        for (let i = count -1; i > 0; i--) {
            yield this.embindUnits[i];
        }
    }

    instances(count = this.embindUnits.length) {
        return this.embindUnits;
    }

  
}
export default UnitsEmbind;
