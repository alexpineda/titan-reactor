import create from "zustand/vanilla";
import {
  UpgradeInProduction,
  ResearchInProduction,
  UnitInProduction,
} from "../../game/GameUnit";

type ProductionStoreState = {
  units: UnitInProduction[];
  tech: ResearchInProduction[][];
  upgrades: UpgradeInProduction[][];
  setAllProduction: (
    units: UnitInProduction[],
    tech: ResearchInProduction[][],
    upgrades: UpgradeInProduction[][]
  ) => void;
};
const useProductionStore = create<ProductionStoreState>((set) => ({
  units: [],
  tech: [],
  upgrades: [],
  setAllProduction: (
    units: UnitInProduction[],
    tech: ResearchInProduction[][],
    upgrades: UpgradeInProduction[][]
  ) => set({ units, tech, upgrades }),
}));

export default useProductionStore;
