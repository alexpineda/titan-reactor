// convenience store for plugin subscriptions
import Chk from "bw-chk";
import { Replay } from "../process-replay/parse-replay";
import create from "zustand";

export type WorldStore = {
    map?: Chk,
    replay?: Replay,
    mapImage?: HTMLCanvasElement,
    reset: () => void,
};

export const useWorldStore = create<WorldStore>((set) => ({
    reset: () => set({ map: undefined, replay: undefined, mapImage: undefined }),
}));

export default () => useWorldStore.getState();

