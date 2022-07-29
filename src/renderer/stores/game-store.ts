import { MinimapDimensions } from "common/types"
import create from "zustand";
import { Assets } from "../../common/types/assets";


export type GameStore = {
  assets: Assets | null;
  dimensions: MinimapDimensions;
  setAssets: (assets: Assets | null) => void;
  setDimensions: (dimensions: MinimapDimensions) => void;
  setDisposeGame: (game: () => void) => void;
  disposeGame: () => void;
  gameDisposer?: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  assets: null,
  dimensions: {
    minimapWidth: 0,
    minimapHeight: 0
  },
  setAssets: (assets: Assets | null) => set({ assets }),
  setDisposeGame: (gameDisposer) => set({ gameDisposer }),
  setDimensions: (dimensions: MinimapDimensions) => set({ dimensions }),
  disposeGame: () => {
    const gameDisposer = get().gameDisposer;
    gameDisposer && gameDisposer();
    set({ gameDisposer: undefined });
  },
}));

export default () => useGameStore.getState();

