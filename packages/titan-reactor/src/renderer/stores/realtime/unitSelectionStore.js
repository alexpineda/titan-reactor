import create from "zustand/vanilla";

const useRealtimeStore = create((set) => ({
  selectedUnits: [],

  setSelectedUnits: (selectedUnits) => {
    set({ selectedUnits });
  },
}));

export default useRealtimeStore;
