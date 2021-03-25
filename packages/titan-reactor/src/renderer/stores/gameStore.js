import { range } from "ramda";
import create from "../../../libs/zustand";

export const CHAT_INTERVAL = 4000;

const useGameStore = create((set, get) => ({
  game: null,
  fogOfWar: true,
  followUnit: null,
  dimensions: {},
  selectedUnits: [],
  chat: [],
  lastChatAdd: Date.now(),
  playerVision: range(0, 8).map(() => true),
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
  addChatMessage: (msg) =>
    set((state) => ({
      chat: [...state.chat, msg],
      lastChatAdd: Date.now(),
    })),
  removeOneFromChat: () => {
    if (Date.now() - get().lastChatAdd < CHAT_INTERVAL) {
      return;
    }
    set((state) => ({ chat: state.chat.slice(1) }));
  },
}));

export default useGameStore;
