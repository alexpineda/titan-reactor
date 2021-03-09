import { range } from "ramda";
import create from "../../../libs/zustand";

const useGameStore = create((set, get) => ({
  game: null,
  fogOfWar: true,
  followUnit: null,
  dimensions: {},
  playerVision: range(0, 8).map(() => true),
  toggleFogOfWar: () => set({ ...get().game, fogOfWar: !get().fogOfWar }),
  togglePlayerVision: (id) =>
    set({
      playerVision: get().playerVision.map((v, i) => (i === id ? !v : v)),
    }),
  toggleFollowUnit: (unit) => set({ followUnit: unit }),
}));

export default useGameStore;
