import create from "zustand/vanilla";

import { CrapUnit } from "../../core";

export type UnitSelectionStore = {
  selectedUnits: CrapUnit[];
  setSelectedUnits: (selectedUnits: CrapUnit[]) => void;
};
export const useUnitSelectionStore = create<UnitSelectionStore>((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits: CrapUnit[]) => {
    set({ selectedUnits });
  },
}));

export default useUnitSelectionStore;
