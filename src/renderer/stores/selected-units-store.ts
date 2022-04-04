import create from "zustand/vanilla";
import { UnitDAT } from "common/bwdat/units-dat";
import { Unit } from "@core";

export type SelectedUnitsStore = {
    selectedUnits: Unit[];
    setSelectedUnits: (unit: Unit[]) => void;
    selectOfType: (type: UnitDAT) => void;
};

export const useSelectedUnitsStore = create<SelectedUnitsStore>((set, get) => ({
    selectedUnits: [],
    setSelectedUnits: (selectedUnits: Unit[]) => {
        for (const unit of get().selectedUnits) {
            unit.extra.selected = false;
        }

        for (const unit of selectedUnits) {
            unit.extra.selected = true;
        }

        set({ selectedUnits });
    },
    selectOfType: (ut) =>
        get().setSelectedUnits(
            get().selectedUnits.filter(({ extra: { dat: unitType } }) => unitType === ut)
        ),
}));

export default () => useSelectedUnitsStore.getState();

