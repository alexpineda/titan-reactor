import create from "zustand";

import { UnitDAT } from "../../common/bwdat/core/units-dat";
import { Player } from "../../common/types/player";
import range from "../../common/utils/range";
import Assets from "../assets";
import { UnitInstance } from "../game/unit-instance";

export const CHAT_INTERVAL = 4000;

let _chatIndex = 0;

type CbatMessage = {
  content: string;
  player: Player;
  id?: number;
};

type GameStore = {
  assets: Assets | null;
  game: any;
  fogOfWar: boolean;
  followUnit: UnitInstance | null;
  dimensions: {};
  selectedUnits: UnitInstance[];
  chat: CbatMessage[];
  lastChatAdd: number;
  playerVision: boolean[];
  setAssets: (assets: Assets | null) => void;
  disposeAssets: () => void;
  setGame: (game: any) => void;
  disposeGame: () => void;
  setSelectedUnits: (unit: UnitInstance[]) => void;
  selectOfType: (type: UnitDAT) => void;
  toggleFogOfWar: () => void;
  togglePlayerVision: (id: number) => void;
  toggleFollowUnit: (unit: UnitInstance) => void;
  addChatMessage: (message: CbatMessage) => void;
  removeOneFromChat: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  assets: null,
  game: null,
  fogOfWar: true,
  followUnit: null,
  dimensions: {},
  selectedUnits: [],
  chat: [],
  lastChatAdd: Date.now(),
  playerVision: range(0, 8).map(() => true),

  setAssets: (assets: Assets | null) => set({ assets }),
  disposeAssets: () => {
    const assets = get().assets;
    assets && assets.dispose();
    get().setAssets(null);
  },

  setGame: (game: any) => set({ game }),
  disposeGame: () => {
    const game = get().game;
    game && game.dispose();
    get().setGame(null);
  },

  setSelectedUnits: (selectedUnits: UnitInstance[]) => {
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
      get().selectedUnits.filter(({ unitType }) => unitType === ut)
    ),
  toggleFogOfWar: () => set((state) => ({ fogOfWar: !state.fogOfWar })),
  togglePlayerVision: (id) =>
    set((state) => ({
      playerVision: state.playerVision.map((v, i) => (i === id ? !v : v)),
    })),
  toggleFollowUnit: (unit: UnitInstance) => set({ followUnit: unit }),
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

//todo figure out which pattern we're using
export const setGame = useGameStore.getState().setGame;
export const disposeGame = useGameStore.getState().disposeGame;
export const disposeAssets = useGameStore.getState().disposeAssets;
export const getAssets = () => useGameStore.getState().assets;
export const getSelectionCircle = (id: number) =>
  getAssets()?.selectionCirclesHD[id];
export const getIcons = () => getAssets()?.icons;
export const setAssets = useGameStore.getState().setAssets;
