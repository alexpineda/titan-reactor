import create from "zustand/vanilla";

const useRealtimeStore = create((set, get) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits) => {
    set({ selectedUnits });
  },
}));

export default useRealtimeStore;
