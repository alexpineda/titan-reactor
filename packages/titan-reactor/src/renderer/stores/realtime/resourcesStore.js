import create from "zustand/vanilla";

const useResourcesStore = create((set) => ({
  minerals: [],
  gas: [],
  supplyUsed: [],
  supplyAvailable: [],
  workerSupply: [],
  apm: [],
  time: "",
  setAllResources: (
    minerals,
    gas,
    supplyUsed,
    supplyAvailable,
    workerSupply,
    apm,
    time
  ) =>
    set({
      minerals,
      gas,
      supplyUsed,
      supplyAvailable,
      workerSupply,
      apm,
      time,
    }),
}));

export default useResourcesStore;
