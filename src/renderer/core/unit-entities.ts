import { UnitsBufferView } from "@buffer-view/units-buffer-view";
import { Unit } from "@core/unit";
import gameStore from "@stores/game-store";
import { IterableMap } from "@utils/data-structures/iteratible-map";

//TODO: Deprecate
// The primary purpose of this class is to provide a storage for damage effects, and serialization to plugins ui
// We can store damage effects in a map, and we can serialize the map to plugins ui via an ArrayBuffer of unitData
export class UnitEntities {
    freeUnits: Unit[] = [];
    units = new IterableMap<number, Unit>();

    externalOnCreateUnit?( unit: Unit ): void;
    externalOnClearUnits?(): void;

    [Symbol.iterator]() {
        return this.units[Symbol.iterator]();
    }

    get( unitId: number ) {
        return this.units.get( unitId );
    }

    getOrCreate( unitStruct: UnitsBufferView ) {
        const unit = this.units.get( unitStruct.id );
        if ( unit ) {
            return unit;
        } else {
            const unit = ( this.freeUnits.pop() ?? { extras: {} } ) as Unit;

            unitStruct.copyTo( unit );
            unit.extras.recievingDamage = 0;
            unit.extras.selected = false;
            unit.extras.dat = gameStore().assets!.bwDat.units[unitStruct.typeId];

            this.units.set( unitStruct.id, unit as unknown as Unit );
            this.externalOnCreateUnit && this.externalOnCreateUnit( unit );
            return unit as unknown as Unit;
        }
    }

    free( unit: Unit ) {
        this.units.delete( unit.id );
        this.freeUnits.push( unit );
    }

    clear() {
        this.freeUnits.push( ...this.units );
        this.units.clear();
        this.externalOnClearUnits && this.externalOnClearUnits();
    }
}
