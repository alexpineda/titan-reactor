import { MinimapDimensions } from "common/types"
import create from "zustand";
import { Assets } from "../../common/types/assets";


export type GameStore = {
  assets: Assets | null;
  dimensions: MinimapDimensions;
  setAssets: (assets: Assets | null) => void;
  setDimensions: (dimensions: MinimapDimensions) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  assets: null,
  dimensions: {
    minimapWidth: 0,
    minimapHeight: 0
  },
  setAssets: (assets: Assets | null) => set({ assets }),
  setDimensions: (dimensions: MinimapDimensions) => set({ dimensions }),
}));

export default () => useGameStore.getState();

