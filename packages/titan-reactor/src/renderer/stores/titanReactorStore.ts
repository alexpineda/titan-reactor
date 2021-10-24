import create from "zustand";

type State = {
  criticalError: Error | null;
  flashError: Error | null;
};

export default create<State>(() => ({
  criticalError: null,
  flashError: null,
}));
