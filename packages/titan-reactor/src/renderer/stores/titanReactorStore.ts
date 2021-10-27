import create from "zustand";

type TitanReactorStoreState = {
  criticalError: Error | null;
  flashError: Error | null;
};

export const useTitanReactorStore = create<TitanReactorStoreState>(() => ({
  criticalError: null,
  flashError: null,
}));

export default useTitanReactorStore;
