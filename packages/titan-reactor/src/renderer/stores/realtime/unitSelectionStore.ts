import create from "zustand/vanilla";

import { UnitInstance } from "../../game/UnitInstance";

type RealtimeStore = {
  selectedUnits: UnitInstance[];
  setSelectedUnits: (selectedUnits: UnitInstance[]) => void;
};
export const useUnitSelectionStore = create<RealtimeStore>((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits: UnitInstance[]) => {
    set({ selectedUnits });
  },
}));

export default useUnitSelectionStore;
