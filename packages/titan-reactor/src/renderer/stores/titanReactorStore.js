import create from "../../../libs/zustand";

export default create(() => ({
  game: null,
  criticalError: null,
  flashError: null,
}));
