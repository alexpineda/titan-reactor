import create from "zustand/vanilla";
import { GameCanvasDimensions } from "common/types";
import Assets from "../assets/assets";
import { onGameDisposed } from "../plugins";

export type GameStore = {
  assets: Assets | null;
  dimensions: GameCanvasDimensions;
  setAssets: (assets: Assets | null) => void;
  setDimensions: (dimensions: GameCanvasDimensions) => void;
  setDisposeGame: (game: () => void) => void;
  disposeGame: () => void;
  log: string[][],
  addLog: (log: string, color?: string) => void;
  clearLog: () => void;
  gameDisposer?: () => void;
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
    minimapWidth: 0,
    minimapHeight: 0
  },
  setAssets: (assets: Assets | null) => set({ assets }),
  setDisposeGame: (gameDisposer) => set({ gameDisposer }),
  setDimensions: (dimensions: GameCanvasDimensions) => set({ dimensions }),
  disposeGame: () => {
    const gameDisposer = get().gameDisposer;
    gameDisposer && gameDisposer();
    onGameDisposed();
    set({ gameDisposer: undefined });
  },
  addLog: (item, color = "white") => {
    set({ log: [...get().log, [item, color]].slice(-10) });
  },
  clearLog: () => set({ log: [] }),
}));

export default () => useGameStore.getState();

