import create from "../../../libs/zustand";

const useLoadingStore = create((set) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  chk: { filename: "", loaded: false },
  rep: { filename: "", loaded: false },
  initRep: (filename) => set({ rep: { filename, loading: true }, chk: {} }),
  updateRep: (data) => set((state) => ({ rep: { ...state.rep, ...data } })),
  updateChk: (data) => set((state) => ({ chk: { ...state.chk, ...data } })),
  initChk: (filename) => set({ chk: { filename, loading: true }, rep: {} }),
  completeRep: () =>
    set((state) => ({ rep: { ...state.rep, loaded: true, loading: false } })),
  completeChk: () =>
    set((state) => ({ chk: { ...state.chk, loaded: true, loading: false } })),
  reset: () => set({ chk: {}, rep: {} }),
  complete: false,
  preloaded: false,
  initialized: false,
}));

export default useLoadingStore;
