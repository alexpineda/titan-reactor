import create from "zustand";

import { UnitDAT } from "../../common/bwdat/core/units-dat";
import { Player, GameCanvasDimensions } from "../../common/types";
import range from "../../common/utils/range";
import Assets from "../assets/assets";
import { Unit } from "../core";

export const CHAT_INTERVAL = 4000;

let _chatIndex = 0;

export type ChatMessage = {
  content: string;
  player: Player;
  id?: number;
};

export type GameStore = {
  assets: Assets | null;
  game: any;
  fogOfWar: boolean;
  followUnit: Unit | null;
  dimensions: GameCanvasDimensions;
  selectedUnits: Unit[];
  chat: ChatMessage[];
  lastChatAdd: number;
  playerVision: boolean[];
  setAssets: (assets: Assets | null) => void;
  disposeAssets: () => void;
  setGame: (game: any) => void;
  disposeGame: () => void;
  setSelectedUnits: (unit: Unit[]) => void;
  selectOfType: (type: UnitDAT) => void;
  toggleFogOfWar: () => void;
  togglePlayerVision: (id: number) => void;
  toggleFollowUnit: (unit: Unit) => void;
  addChatMessage: (message: ChatMessage) => void;
  removeOneFromChat: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  assets: null,
  game: null,
  fogOfWar: true,
  followUnit: null,
  dimensions: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    minimapSize: 0,
  },
  selectedUnits: [],
  chat: [],
  lastChatAdd: Date.now(),
  playerVision: range(0, 8).map(() => true),
  setAssets: (assets: Assets | null) => set({ assets }),
  disposeAssets: () => {
    get().setAssets(null);
  },

  setGame: (game: any) => set({ game }),
  disposeGame: () => {
    const game = get().game;
    game && game.dispose();
    get().setGame(null);
  },

  setSelectedUnits: (selectedUnits: Unit[]) => {
    for (const unit of get().selectedUnits) {
      unit.selected = false;
    }

    for (const unit of selectedUnits) {
      unit.selected = true;
    }

    set({ selectedUnits });
  },
  selectOfType: (ut) =>
    get().setSelectedUnits(
      get().selectedUnits.filter(({ dat: unitType }) => unitType === ut)
    ),
  toggleFogOfWar: () => set((state) => ({ fogOfWar: !state.fogOfWar })),
  togglePlayerVision: (id) =>
    set((state) => ({
      playerVision: state.playerVision.map((v, i) => (i === id ? !v : v)),
    })),
  toggleFollowUnit: (unit: Unit) => set({ followUnit: unit }),
  addChatMessage: (msg) => {
    let chat = [...get().chat, { ...msg, id: _chatIndex++ }];
    if (chat.length > 10) {
      chat = chat.slice(1);
    }
    set({
      chat,
      lastChatAdd: Date.now(),
    });
  },
  removeOneFromChat: () => {
    if (Date.now() - get().lastChatAdd < CHAT_INTERVAL) {
      return;
    }
    set((state) => ({ chat: state.chat.slice(1) }));
  },
}));

export default useGameStore;

export const getGame = () => useGameStore.getState().game;
export const setGame = useGameStore.getState().setGame;


export const disposeGame = useGameStore.getState().disposeGame;
export const disposeAssets = useGameStore.getState().disposeAssets;
export const getAssets = () => useGameStore.getState().assets;
export const getSelectionCircle = (id: number) =>
  getAssets()?.selectionCirclesHD[id];
export const setAssets = useGameStore.getState().setAssets;
