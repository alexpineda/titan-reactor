import { GameUnitI } from "../../game/GameUnit";
import create from "zustand/vanilla";

type RealtimeStore = {
  selectedUnits: GameUnitI[];
  setSelectedUnits: (selectedUnits: GameUnitI[]) => void;
};
const useRealtimeStore = create<RealtimeStore>((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits: GameUnitI[]) => {
    set({ selectedUnits });
  },
}));

export default useRealtimeStore;
