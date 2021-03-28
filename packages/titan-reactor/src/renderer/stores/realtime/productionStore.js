import create from "zustand/vanilla";

const useProductionStore = create((set) => ({
  units: [],
  tech: [],
  upgrades: [],
  setAllProduction: (units, tech, upgrades) => set({ units, tech, upgrades }),
}));

export default useProductionStore;
