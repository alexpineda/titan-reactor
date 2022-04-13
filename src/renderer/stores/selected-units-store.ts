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
            unit.extras.selected = false;
        }

        for (const unit of selectedUnits) {
            unit.extras.selected = true;
        }

        set({ selectedUnits });
    },
    selectOfType: (ut) =>
        get().setSelectedUnits(
            get().selectedUnits.filter(({ extras: { dat: unitType } }) => unitType === ut)
        ),
}));

export default () => useSelectedUnitsStore.getState();

