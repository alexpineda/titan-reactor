import create from "../../../libs/zustand";

const useLoadingStore = create((set, get) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  chk: { filename: "", loaded: false },
  rep: { filename: "", loaded: false },
  initRep: (filename) => set({ rep: { filename, loading: true }, chk: {} }),
  updateRep: (data) => set({ rep: { ...get().rep, ...data } }),
  updateChk: (data) => set({ chk: { ...get().chk, ...data } }),
  initChk: (filename) => set({ chk: { filename, loading: true }, rep: {} }),
  completeRep: () =>
    set({ rep: { ...get().rep, loaded: true, loading: false } }),
  completeChk: () =>
    set({ chk: { ...get().chk, loaded: true, loading: false } }),
  complete: false,
  preloaded: false,
  initialized: false,
}));

export default useLoadingStore;
