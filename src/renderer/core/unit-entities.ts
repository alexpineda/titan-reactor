import { UnitsBufferView } from "@buffer-view/units-buffer-view";
import { Unit } from "@core/unit";
import gameStore from "@stores/game-store";

export class UnitEntities {
    freeUnits: Unit[] = [];
    units: Map<number, Unit> = new Map;

    externalOnFreeUnit?(unit: Unit): void;
    externalOnCreateUnit?(unit: Unit): void;
    externalOnClearUnits?(): void;


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
            this.externalOnCreateUnit && this.externalOnCreateUnit(unit);
            return unit as unknown as Unit;
        }
    }

    free(unitId: number) {
        const unit = this.units.get(unitId);
        if (unit) {
            this.units.delete(unitId);
            this.freeUnits.push(unit);
            this.externalOnFreeUnit && this.externalOnFreeUnit(unit);
        }
    }

    clear() {
        this.freeUnits.push(...this.units.values());
        this.units.clear();
        this.externalOnClearUnits && this.externalOnClearUnits();
    }
}