import create from "zustand/vanilla";
import { UnitDAT } from "common/bwdat/units-dat";
import { Unit } from "@core";

export type SelectedUnitsStore = {
    selectedUnits: Unit[];
    setSelectedUnits: (unit: Unit[]) => void;
    appendSelectedUnits: (unit: Unit[]) => void;
    clear: () => void;
    selectOfType: (type: UnitDAT) => void;
    removeUnit: (unit: Unit) => void;
};

export const useSelectedUnitsStore = create<SelectedUnitsStore>((set, get) => ({
    selectedUnits: [],
    setSelectedUnits: (selectedUnits: Unit[]) => {
        for (const unit of get().selectedUnits) {
            unit.extras.selected = false;
        }

        for (const unit of selectedUnits) {
            unit.extras.selected = true;
        }

        set({ selectedUnits });
    },
    appendSelectedUnits: (selectedUnits: Unit[]) => {
        let uniques = selectedUnits.filter(u => !u.extras.selected);

        for (const unit of uniques) {
            unit.extras.selected = true;
        }

        set({ selectedUnits: [...get().selectedUnits, ...uniques] });
    },
    clear() {
        for (const unit of get().selectedUnits) {
            unit.extras.selected = false;
        }
        set({ selectedUnits: [] });
    },
    removeUnit(unit) {
        unit.extras.selected = false;
        set({ selectedUnits: get().selectedUnits.filter(u => u !== unit) });
    },
    selectOfType: (ut) =>
        get().setSelectedUnits(
            get().selectedUnits.filter(({ extras: { dat: unitType } }) => unitType === ut)
        ),
}));

export default () => useSelectedUnitsStore.getState();

