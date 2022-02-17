import create from "zustand";
import { GameCanvasDimensions } from "../../common/types";
import Assets from "../assets/assets";

export type GameStore = {
  assets: Assets | null;
  gameDisposer?: () => void;
  dimensions: GameCanvasDimensions;
  setAssets: (assets: Assets | null) => void;
  setDisposeGame: (game: () => void) => void;
  disposeGame: () => void;
  log: string[][],
  addLog: (log: string, color?: string) => void;
  clearLog: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  log: [],
  assets: null,
  dimensions: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    minimapSize: 0,
  },
  setAssets: (assets: Assets | null) => set({ assets }),
  setDisposeGame: (gameDisposer) => set({ gameDisposer }),
  disposeGame: () => {
    const gameDisposer = get().gameDisposer;
    gameDisposer && gameDisposer();
    set({ gameDisposer: undefined });
  },
  addLog: (item, color = "white") => {
    set({ log: [...get().log, [item, color]] });
  },
  clearLog: () => set({ log: [] }),
}));

export default () => useGameStore.getState();

