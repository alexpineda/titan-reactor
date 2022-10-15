// convenience store for plugin subscriptions
import Chk from "bw-chk";
import { Replay } from "../process-replay/parse-replay";
import create from "zustand";

export interface ReplayAndMapStore {
    type: "map" | "replay" | "live";
    live: boolean;
    map?: Chk;
    replay?: Replay;
    mapImage?: HTMLCanvasElement;
    reset: () => void;
}

export const useReplayAndMapStore = create<ReplayAndMapStore>( ( set, get ) => ( {
    get type() {
        return get().live ? "live" : get().replay ? "replay" : "map";
    },
    live: false,
    reset: () =>
        set( { live: false, map: undefined, replay: undefined, mapImage: undefined } ),
} ) );

export const replayAndMapStore = () => useReplayAndMapStore.getState();
