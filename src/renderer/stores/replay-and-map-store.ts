// convenience store for plugin subscriptions
import Chk from "bw-chk";
import { Replay } from "../process-replay/parse-replay";
import create from "zustand";

export type ReplayAndMapStore = {
    map?: Chk,
    replay?: Replay,
    mapImage?: HTMLCanvasElement,
    reset: () => void,
};

export const useReplayAndMapStore = create<ReplayAndMapStore>((set) => ({
    reset: () => set({ map: undefined, replay: undefined, mapImage: undefined }),
}));

export const replayAndMapStore = () => useReplayAndMapStore.getState();

