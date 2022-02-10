import { OpenBWWasm } from "src/renderer/openbw";
import { SpritesBufferView } from ".";
import { SpriteStruct, UnitStruct } from "../structs";
import { FP8 } from "./fixed-point";
import { IntrusiveList } from "./intrusive-list";

/**
 * Maps to openbw unit_t starting from index address
 */
export class UnitsBufferView
    implements UnitStruct {
    static unit_generation_size = 0;

    _address = 0;
    _bw: OpenBWWasm;
    _sprite: SpritesBufferView;
    _subunit?: UnitsBufferView;

    get(address: number) {
        this._address = address;
        return this;
    }

    constructor(bw: OpenBWWasm) {
        this._bw = bw;
        this._sprite = new SpritesBufferView(bw);
    }
    // if (dumping->unit_type->flags & dumping->unit_type->flag_resource && dumping->status_flags & dumping->status_flag_completed)
    // 	{
    // 		// DUMP_RAW(resourceAmount, dumping->building.resource.resource_count);
    // 		DUMP_RAW(remainingBuildtime, 0);
    // 	}
    // 	else
    // 	{
    // 		// DUMP_RAW(resourceAmount, 0);
    // 		DUMP_VAL_AS(remainingBuildtime, remaining_build_time);
    // 	}

    get remainingBuildTime() {
        return 0;
    }

    get resourceAmount() {
        return 0;
    }

    get remainingTrainTime() {
        // 	if (dumping->current_build_unit)
        // 	{
        // 		int remainingTrainTime = ((float)dumping->current_build_unit->remaining_build_time / (float)dumping->current_build_unit->unit_type->build_time) * 255;
        // 		DUMP_RAW(remainingTrainTime, remainingTrainTime);
        // 	}
        // 	else
        // 	{
        // 		DUMP_RAW(resourceAmount, 0);
        // 	}
        return 0;
    }

    private get _index32() {
        return (this._address >> 2) + 2; //skip link base
    }

    get id() {
        const gen = this.generation % (1 << UnitsBufferView.unit_generation_size);
        return (this.index + 1) | (gen << (16 - UnitsBufferView.unit_generation_size));
    }

    tryGet(index: number) {
        return this._bw.HEAP32[this._index32 + index];
    }

    tryUGet(index: number) {
        return this._bw.HEAPU32[this._index32 + index];
    }

    tryFPGet(index: number) {
        return FP8(this._bw.HEAPU32[this._index32 + index]);
    }

    //thingy_t
    get hp() {
        return FP8(this._bw.HEAPU32[this._index32]);
    }

    get owSprite() {
        const spriteAddr = this._bw.HEAPU32[this._index32 + 1];
        return this._sprite.get(spriteAddr);
    }
    // flingy_t
    get index() {
        return this._bw.HEAPU32[this._index32 + 2];
    }

    // target = 3
    // movement waypoint = 2
    // target waypoint= 2
    // movement flags = 1

    get direction() {
        const heading = this._bw.HEAP32[this._index32 + 10];
        // auto v = dir.fractional_part();
        // if (v < 0) return 256 + v;
        // else return v;

        // raw_type fractional_part() const {
        //     return raw_value & (((raw_type)1 << fractional_bits) - 1);
        // }
        return 0;
    }

    get x() {
        return this._bw.HEAP32[this._index32 + 16];
    }

    get y() {
        return this._bw.HEAP32[this._index32 + 17];
    }

    // unit_t
    get owner() {
        return this._bw.HEAP32[this._index32 + 28];
    }

    get order() {
        const _order = this._bw.HEAPU32[this._index32 + 32];
        if (_order === 0) return null;
        return this._bw.HEAP32[_order >> 2];
    }

    get groundWeaponCooldown() {
        return this._bw.HEAPU32[this._index32 + 35];
    }

    get airWeaponCooldown() {
        return this._bw.HEAPU32[this._index32 + 36];
    }

    get spellCooldown() {
        return this._bw.HEAPU32[this._index32 + 37];
    }

    get orderTargetAddr() {
        return this._bw.HEAPU32[this._index32 + 38];
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
        return FP8(this._bw.HEAPU32[this._index32 + 39]);
    }

    get typeId() {
        const addr = this._bw.HEAPU32[this._index32 + 40];
        return this._bw.HEAP32[addr >> 2];
    }

    get typeFlags() {
        const addr = this._bw.HEAPU32[this._index32 + 40];
        return this._bw.HEAPU32[(addr >> 2) + 35];
    }

    // player_units_link 2

    get subunit(): UnitStruct | null {
        const addr = this._bw.HEAPU32[this._index32 + 43];
        if (addr === 0) return null;
        if (this._subunit === undefined) {
            this._subunit = new UnitsBufferView(this._bw);
        }
        return this._subunit.get(addr);
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
        return this._bw.HEAP32[this._index32 + 58];
    }
    // 	int last_attacking_player;
    // 	int secondary_order_timer;
    // 	int user_action_flags; 
    // 	int cloak_counter;
    // 	int movement_state; 
    // 	static_vector<const unit_type_t *, 5> build_queue; 6 wide
    get energy() {
        return FP8(this._bw.HEAPU32[this._index32 + 68]);
    }

    get generation() {
        return this._bw.HEAPU32[this._index32 + 69];
    }

    // 	const order_type_t *secondary_order_type;
    // 	int damage_overlay_state;
    // 	fp8 hp_construction_rate;
    // 	fp8 shield_construction_rate;
    // 	int remaining_build_time;
    // 	int previous_hp;
    // 	std::array<unit_id, 8> loaded_units; 4 wide

    get statusFlags() {
        return this._bw.HEAP32[this._index32 + 88];
    }



    copyTo(dest: any) {
        dest.id = this.id;
        dest.hp = this.hp;
        dest.direction = this.direction;
        dest.typeId = this.typeId;
        dest.owner = this.owner;
        dest.order = this.order;
        dest.shields = this.shields;
        dest.energy = this.energy;
        dest.kills = this.kills;
        dest.statusFlags = this.statusFlags;
        dest.x = this.x;
        dest.y = this.y;
    }


}
export default UnitsBufferView;
