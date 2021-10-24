import create from "zustand";

// loading store which contains state on loading status, as well as loaded replay and map data
export const ASSETS_MAX = 1010;
export const MAP_GENERATION_MAX = 50;

const useLoadingStore = create((set) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  chk: { filename: "", loaded: false },
  rep: { filename: "", loaded: false },
  assetsLoaded: 0,
  assetsComplete: false,
  mapGenerationComplete: false,
  mapGenerationProgress: 0,
  increaseAssetsLoaded: () =>
    set((state) => ({ assetsLoaded: state.assetsLoaded + 1 })),
  completeAssetsLoaded: () => set({ assetsComplete: true, assetsLoaded: 0 }),
  increaseMapGenerationProgress: () =>
    set((state) => ({
      mapGenerationProgress: state.mapGenerationProgress + 1,
      mapGenerationComplete: false,
    })),
  completeMapGeneration: () =>
    set({ mapGenerationComplete: true, mapGenerationProgress: 0 }),
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

export const increaseMapGenerationProgress =
  useLoadingStore.getState().increaseMapGenerationProgress;
export const completeMapGeneration =
  useLoadingStore.getState().completeMapGeneration;
