import { UnitsBufferView } from "@buffer-view/units-buffer-view";
import { Unit } from "@core/unit";
import { HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED } from "@plugins/hooks";
import gameStore from "@stores/game-store";
import selectedUnitsStore from "@stores/selected-units-store";
import { clearFollowedUnits, unfollowUnit } from "./followed-units";
import * as plugins from "@plugins";

export class UnitEntities {
    freeUnits: Unit[] = [];
    units: Map<number, Unit> = new Map;

    get(unitId: number) {
        return this.units.get(unitId);
    }

    getOrCreate(unitData: UnitsBufferView) {
        const unit = this.units.get(unitData.id);
        if (unit) {
            return unit;
        } else {
            const unit = (this.freeUnits.pop() ?? { extras: {} }) as Unit;

            unitData.copyTo(unit)
            unit.extras.recievingDamage = 0;
            unit.extras.selected = false;
            unit.extras.dat = gameStore().assets!.bwDat.units[unitData.typeId];
            unit.extras.turretLo = null;

            this.units.set(unitData.id, unit as unknown as Unit);
            plugins.callHook(HOOK_ON_UNIT_CREATED, unit);
            return unit as unknown as Unit;
        }
    }

    free(unitId: number) {
        const unit = this.units.get(unitId);
        if (unit) {
            this.units.delete(unitId);
            this.freeUnits.push(unit);
            selectedUnitsStore().removeUnit(unit);
            unfollowUnit(unit);
            plugins.callHook(HOOK_ON_UNIT_KILLED, unit);
        }
    }

    clear() {
        this.units.clear();
        selectedUnitsStore().clearSelectedUnits();
        clearFollowedUnits();
    }
}