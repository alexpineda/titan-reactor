import create from "zustand";

const useComponentsStore = create((set, get) => ({
  components: new Map(),
  get: (key) => get().components.get(key),
  set: (key, val) => set((state) => state.components.set(key, val)),
}));

export default useComponentsStore;

export const getComponent = useComponentsStore.getState().get;
export const setComponent = useComponentsStore.getState().set;
