import create from "zustand";
export default create(() => ({
  game: null,
  criticalError: null,
  flashError: null,
}));
