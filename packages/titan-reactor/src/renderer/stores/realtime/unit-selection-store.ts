import create from "zustand/vanilla";

import { UnitInstance } from "../../game/unit-instance";

export type UnitSelectionStore = {
  selectedUnits: UnitInstance[];
  setSelectedUnits?: (selectedUnits: UnitInstance[]) => void;
};
export const useUnitSelectionStore = create<UnitSelectionStore>((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits: UnitInstance[]) => {
    set({ selectedUnits });
  },
}));

export default useUnitSelectionStore;
