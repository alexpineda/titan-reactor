import create from "zustand/vanilla";

import {
  ResearchInProduction,
  UnitInProduction,
  UpgradeInProduction,
} from "../../../common/types";

export type ProductionStore = {
  units: UnitInProduction[];
  tech: ResearchInProduction[][];
  upgrades: UpgradeInProduction[][];
  setAllProduction: (
    units: UnitInProduction[],
    tech: ResearchInProduction[][],
    upgrades: UpgradeInProduction[][]
  ) => void;
};
export const useProductionStore = create<ProductionStore>((set) => ({
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