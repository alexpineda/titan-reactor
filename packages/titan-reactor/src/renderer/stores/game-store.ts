import create from "zustand";
import { GameCanvasDimensions, Player } from "../../common/types";
import Assets from "../assets/assets";

export type GameStore = {
  assets: Assets | null;
  fps: string;
  dimensions: GameCanvasDimensions;
  latestPluginContentSize?: { channelId: string, width?: string | number; height?: string | number };
  setLatestPluginContentSize: (channelId: string, width?: string | number, height?: string | number) => void;
  players: Player[];
  setFps: (fps: string) => void;
  setAssets: (assets: Assets | null) => void;
  setDimensions: (dimensions: GameCanvasDimensions) => void;
  setPlayers: (players: Player[]) => void;
  setDisposeGame: (game: () => void) => void;
  disposeGame: () => void;
  log: string[][],
  addLog: (log: string, color?: string) => void;
  clearLog: () => void;
  gameDisposer?: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  log: [],
  players: [],
  fps: "0",
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
  setFps: (fps: string) => set({ fps }),
  setAssets: (assets: Assets | null) => set({ assets }),
  setDisposeGame: (gameDisposer) => set({ gameDisposer }),
  setDimensions: (dimensions: GameCanvasDimensions) => set({ dimensions }),
  setPlayers: (players: Player[]) => set({ players }),
  setLatestPluginContentSize: (channelId: string, width?: string | number, height?: string | number) => {
    set({ latestPluginContentSize: { channelId, width, height } })
  },
  disposeGame: () => {
    const gameDisposer = get().gameDisposer;
    gameDisposer && gameDisposer();
    set({ gameDisposer: undefined });
  },
  addLog: (item, color = "white") => {
    set({ log: [...get().log, [item, color]].slice(-10) });
  },
  clearLog: () => set({ log: [] }),
}));

export default () => useGameStore.getState();

