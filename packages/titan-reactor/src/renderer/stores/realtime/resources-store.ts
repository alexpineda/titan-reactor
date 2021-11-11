import create from "zustand/vanilla";

export type ResourcesStore = {
  minerals: number[];
  gas: number[];
  supplyUsed: number[];
  supplyAvailable: number[];
  workerSupply: number[];
  apm: number[];
  time: string;
  setAllResources: (
    minerals: number[],
    gas: number[],
    supplyUsed: number[],
    supplyAvailable: number[],
    workerSupply: number[],
    apm: number[],
    time: string
  ) => void;
};
export const useResourcesStore = create<ResourcesStore>((set) => ({
  minerals: [],
  gas: [],
  supplyUsed: [],
  supplyAvailable: [],
  workerSupply: [],
  apm: [],
  time: "",
  setAllResources: (
    minerals: number[],
    gas: number[],
    supplyUsed: number[],
    supplyAvailable: number[],
    workerSupply: number[],
    apm: number[],
    time: string
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
