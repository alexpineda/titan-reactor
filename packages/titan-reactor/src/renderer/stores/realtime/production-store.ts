import create from "zustand/vanilla";

import {
  ResearchInProduction,
  UnitInProduction,
  UpgradeInProduction,
} from "../../game/unit-instance";

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
export const useProductionStore = create<ProductionStoreState>((set) => ({
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
