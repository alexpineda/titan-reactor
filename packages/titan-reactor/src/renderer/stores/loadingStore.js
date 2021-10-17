import create from "../../../libs/zustand";

// loading store which contains state on loading status, as well as loaded replay and map data
export const ASSETS_MAX = 1010;

const useLoadingStore = create((set, get) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  chk: { filename: "", loaded: false },
  rep: { filename: "", loaded: false },
  assetsLoaded: 0,
  assetsComplete: false,
  increaseAssetsLoaded: () => set({ assetsLoaded: get().assetsLoaded + 1 }),
  completeAssetsLoaded: () => set({ assetsComplete: true }),
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

export const increaseAssetsLoaded =
  useLoadingStore.getState().increaseAssetsLoaded;
export const completeAssetsLoaded =
  useLoadingStore.getState().completeAssetsLoaded;
