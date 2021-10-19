import { range } from "ramda";
import create from "../../../libs/zustand";

export const CHAT_INTERVAL = 4000;

let _chatIndex = 0;

const useGameStore = create((set, get) => ({
  assets: null,

  game: null,
  fogOfWar: true,
  followUnit: null,
  dimensions: {},
  selectedUnits: [],
  chat: [],
  lastChatAdd: Date.now(),
  playerVision: range(0, 8).map(() => true),

  disposeAssets: () => {
    const assets = get().assets;
    assets && assets.dispose();
    get().setAssets(null);
  },

  setGame: (game) => set({ game }),
  disposeGame: () => {
    const game = get().game;
    game && game.dispose();
    get().setGame(null);
  },

  setSelectedUnits: (selectedUnits) => {
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
  toggleFollowUnit: (unit) => set({ followUnit: unit }),
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
export const setAssets = (assets) => useGameStore.setState({ assets });
export const getSelectionCircle = (id) => getAssets().selectionCirclesHD[id];
export const getIcons = () => getAssets().icons;
