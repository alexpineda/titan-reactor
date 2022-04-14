import create from "zustand";
import { GameCanvasDimensions } from "common/types";
import Assets from "../assets/assets";
import { onGameDisposed } from "../plugins";

type MinimapDimensions = Pick<GameCanvasDimensions, "minimapWidth" | "minimapHeight">;

export type GameStore = {
  assets: Assets | null;
  dimensions: MinimapDimensions;
  setAssets: (assets: Assets | null) => void;
  setDimensions: (dimensions: MinimapDimensions) => void;
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
    minimapEnabled: false,
    minimapWidth: 0,
    minimapHeight: 0
  },
  setAssets: (assets: Assets | null) => set({ assets }),
  setDisposeGame: (gameDisposer) => set({ gameDisposer }),
  setDimensions: (dimensions: MinimapDimensions) => set({ dimensions }),
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

