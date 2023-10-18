// convenience store for plugin subscriptions
import type Chk from "bw-chk";
import create from "zustand";
import { ValidatedReplay } from "renderer/scenes/replay-scene-loader";
import { Replay } from "process-replay";

export interface ReplayAndMapStore {
    type: "map" | "replay" | "live";
    live: boolean;
    map?: Chk;
    replay?: Replay;
    mapImage?: HTMLCanvasElement;
    reset: () => void;
    totalGameTime: number;

    addToTotalGameTime: (t: number) => void;
    replayQueue: ValidatedReplay[];
    nextReplay: ValidatedReplay | undefined;
    addReplaysToQueue: (replays: ValidatedReplay[]) => void;
    deleteReplayQueueItem: (replay: ValidatedReplay) => void;
    queueUpNextReplay: (replay: ValidatedReplay) => void;
    clearReplayQueue: () => void;
    flushWatchedReplays: () => void;
}

export const useReplayAndMapStore = create<ReplayAndMapStore>( ( set, get ) => ( {
    totalGameTime: 0,
    replayQueue: [],
    nextQueuedReplay: undefined,
    nextReplay: undefined,
    queueUpNextReplay: (replay: ValidatedReplay) => {
        set( { nextReplay: replay } );
    },
    addReplaysToQueue: (replays: ValidatedReplay[]) => {
        set( { replayQueue: [...get().replayQueue, ...replays] } );
    },
    deleteReplayQueueItem: (replay: ValidatedReplay) => {
        const replayQueue = get().replayQueue;
        set( { replayQueue: replayQueue.filter( r => r !== replay ) } );
    },
    clearReplayQueue: () => {
        set( { replayQueue: [] } );
        set({nextReplay: undefined});
    },
    flushWatchedReplays: () => {
        const idx = get().replayQueue.findIndex( r => r === get().nextReplay );
        if (idx !== -1) {
            set( { replayQueue: get().replayQueue.slice( idx ) } );
        }
    },
    addToTotalGameTime(t: number) {
        set( { totalGameTime: get().totalGameTime + t } );
    },
    get type() {
        return get().live ? "live" : get().replay ? "replay" : "map";
    },
    live: false,
    reset: () =>
        set( { live: false, map: undefined, replay: undefined, mapImage: undefined } ),
} ) );

export const replayAndMapStore = () => useReplayAndMapStore.getState();
