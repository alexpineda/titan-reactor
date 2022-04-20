import create from "zustand/vanilla";
import { Unit } from "@core";

export type SelectedUnitsStore = {
    selectedUnits: Unit[];
    setSelectedUnits: (unit: Unit[]) => void;
    clearSelectedUnits: () => void;
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
    clearSelectedUnits() {
        for (const unit of get().selectedUnits) {
            unit.extras.selected = false;
        }
        set({ selectedUnits: [] });
    },
    removeUnit(unit) {
        unit.extras.selected = false;
        set({
            selectedUnits: get().selectedUnits.filter(u => u !== unit)
        });
    }
}));

export default () => useSelectedUnitsStore.getState();

