import create from "zustand/vanilla";

import { Unit } from "../../core";

export type UnitSelectionStore = {
  selectedUnits: Unit[];
  setSelectedUnits: (selectedUnits: Unit[]) => void;
};
export const useUnitSelectionStore = create<UnitSelectionStore>((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits: Unit[]) => {
    set({ selectedUnits });
  },
}));

export default useUnitSelectionStore;
