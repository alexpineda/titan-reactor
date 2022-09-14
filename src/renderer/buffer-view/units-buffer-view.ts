import { Unit } from "../core";
import { UnitStruct } from "common/types/structs";
import { FP8 } from "./fixed-point";
import { FlingyBufferView } from "./flingy-buffer-view";
import { OpenBW } from "common/types";
import { IntrusiveList } from "./intrusive-list";

/**
 * Maps to openbw unit_t
 */
export class UnitsBufferView extends FlingyBufferView
    implements UnitStruct {

    #subunit?: UnitsBufferView;
    #currentBuildUnit?: UnitsBufferView;

    get resourceAmount() {
        return 0;
    }

    get id() {
        const gen = this.generation % (1 << this._bw.unitGenerationSize);
        return (this.index + 1) | (gen << (16 - this._bw.unitGenerationSize));
    }

    get owner() {
        return this._bw.HEAP32[this._addr32 + 28];
    }

    get order() {
        const _order = this._bw.HEAPU32[this._addr32 + 29];
        if (_order === 0) return null;
        return this._bw.HEAP32[_order >> 2];
    }

    get groundWeaponCooldown() {
        return this._bw.HEAPU32[this._addr32 + 35];
    }

    get airWeaponCooldown() {
        return this._bw.HEAPU32[this._addr32 + 36];
    }

    get spellCooldown() {
        return this._bw.HEAPU32[this._addr32 + 37];
    }

    get orderTargetAddr() {
        return this._bw.HEAPU32[this._addr32 + 38];
    }

    get orderTargetX() {
        return this._bw.HEAP32[(this.orderTargetAddr >> 2)];
    }

    get orderTargetY() {
        return this._bw.HEAP32[(this.orderTargetAddr >> 2) + 1];
    }

    get orderTargetUnit() {
        return this._bw.HEAPU32[(this.orderTargetAddr >> 2) + 2];
    }

    get shields() {
        return FP8(this._bw.HEAPU32[this._addr32 + 39]);
    }

    get typeId() {
        const addr = this._bw.HEAPU32[this._addr32 + 40];
        return this._bw.HEAP32[addr >> 2];
    }

    get typeFlags() {
        const addr = this._bw.HEAPU32[this._addr32 + 40];
        return this._bw.HEAPU32[(addr >> 2) + 35];
    }

    // player_units_link 2

    get subunit(): UnitStruct | null {
        // turrets will reference their parent unit, so we can't just return this
        // unless we want an infinite loop
        if (this.typeFlags & 0x10) {
            return null;
        }

        const addr = this._bw.HEAPU32[this._addr32 + 43];
        if (addr === 0) return null;
        if (this.#subunit === undefined) {
            this.#subunit = new UnitsBufferView(this._bw);
        }
        return this.#subunit.get(addr);
    }

    get parentUnit(): UnitStruct | null {
        if ((this.typeFlags & 0x10) === 0) {
            return null;
        }

        const addr = this._bw.HEAPU32[this._addr32 + 43];
        if (addr === 0) return null;
        if (this.#subunit === undefined) {
            this.#subunit = new UnitsBufferView(this._bw);
        }
        return this.#subunit.get(addr);
    }

    get subunitId(): number | null {
        const addr = this._bw.HEAPU32[this._addr32 + 43];
        if (addr === 0) return null;
        if (this.#subunit === undefined) {
            this.#subunit = new UnitsBufferView(this._bw);
        }
        return this.#subunit.get(addr).id;
    }


    // order_queue 2
    // 	unit_t *auto_target_unit
    // 	unit_t *connected_unit
    // 	int order_queue_count
    // 	int order_process_timer
    // 	int unknown_0x086 
    // 	int attack_notify_timer 
    // 	const unit_type_t *previous_unit_type
    // 	int last_event_timer
    // 	int last_event_color
    // 	int rank_increase
    // 	int kill_count
    get kills() {
        return this._bw.HEAP32[this._addr32 + 56];
    }
    // 	int last_attacking_player;
    // 	int secondary_order_timer;
    // 	int user_action_flags; 
    // 	int cloak_counter;
    // 	int movement_state; 
    // 	static_vector<const unit_type_t *, 5> build_queue; 6 wide
    get energy() {
        return FP8(this._bw.HEAPU32[this._addr32 + 68]);
    }

    get generation() {
        return this._bw.HEAPU32[this._addr32 + 69];
    }

    // 	const order_type_t *secondary_order_type; 70
    // 	int damage_overlay_state; 71
    // 	fp8 hp_construction_rate; 72
    // 	fp8 shield_construction_rate; 73

    get remainingBuildTime() {
        return this._bw.HEAPU32[this._addr32 + 74];
    }
    // 	int previous_hp; 75
    // 	std::array<unit_id, 8> loaded_units; 4 wide 83

    get statusFlags() {
        return this._bw.HEAP32[this._addr32 + 113];
    }

    // int carrying_flags; 114
    // int wireframe_randomizer; 115
    // int secondary_order_state; 116
    // int move_target_timer; 117
    // uint32_t detected_flags; 118

    get currentBuildUnit(): UnitStruct | null {
        const addr = this._bw.HEAPU32[this._addr32 + 119];
        if (addr === 0) return null;
        if (this.#currentBuildUnit === undefined) {
            this.#currentBuildUnit = new UnitsBufferView(this._bw);
        }
        const unit = this.#currentBuildUnit.get(addr);
        return unit;
    }

    override copyTo(dest: Partial<Unit>) {
        super.copyTo(dest);
        dest.id = this.id;
        dest.typeId = this.typeId;
        dest.owner = this.owner;
        dest.order = this.order;
        dest.shields = this.shields;
        dest.energy = this.energy;
        dest.kills = this.kills + (this.subunit?.kills ?? 0);
        dest.statusFlags = this.statusFlags;
        dest.remainingBuildTime = this.remainingBuildTime;
        dest.subunitId = this.subunitId;
    }

    copy(bufferView = new UnitsBufferView(this._bw)) {
        return bufferView.get(this._address);
    }

}


export class UnitsBufferViewIterator {
    #bw: OpenBW;
    #unitList: IntrusiveList;
    #unitBufferView: UnitsBufferView;

    constructor(openBW: OpenBW) {
        this.#bw = openBW;
        this.#unitList = new IntrusiveList(openBW.HEAPU32, 0, 43);
        this.#unitBufferView = new UnitsBufferView(openBW);
    }

    *[Symbol.iterator]() {
        const playersUnitAddr = this.#bw.getUnitsAddr();

        for (let p = 0; p < 12; p++) {
            this.#unitList.addr = playersUnitAddr + (p << 3);
            for (const unitAddr of this.#unitList) {
                yield this.#unitBufferView.get(unitAddr)
            }
        }
    }
}

export function* destroyedUnitsIterator(openBW: OpenBW) {

    const deletedUnitCount = openBW._counts(17);
    const deletedUnitAddr = openBW._get_buffer(5);

    for (let i = 0; i < deletedUnitCount; i++) {
        yield openBW.HEAP32[(deletedUnitAddr >> 2) + i];
    }
    
}

export function* killedUnitIterator(openBW: OpenBW) {
    
    const deletedUnitCount = openBW._counts(19);
    const deletedUnitAddr = openBW._get_buffer(13);

    for (let i = 0; i < deletedUnitCount; i++) {
        yield openBW.HEAP32[(deletedUnitAddr >> 2) + i];
    }

}
