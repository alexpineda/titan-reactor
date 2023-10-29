// convenience store for plugin subscriptions
import type Chk from "bw-chk";
import create from "zustand";
import { replaySceneLoader, ValidatedReplay } from "../scenes/replay-scene-loader";
import sceneStore from "./scene-store";
import { homeSceneLoader } from "../scenes/home/home-scene-loader";
import { mapSceneLoader } from "../scenes/map-scene-loader";

export interface ReplayAndMapStore {
    type: "map" | "replay" | "live";
    live: boolean;
    map?: Chk;
    replay?: ValidatedReplay;
    mapImage?: HTMLCanvasElement;
    reset: () => void;
    totalGameTime: number;

    replayIndex: number;
    addToTotalGameTime: ( t: number ) => void;
    replayQueue: ValidatedReplay[];
    getNextReplay: ( this: void ) => ValidatedReplay | undefined;
    addReplaysToQueue: ( replays: ValidatedReplay[] ) => void;
    addReplayToQueue: ( replay: ValidatedReplay ) => void;
    deleteReplayQueueItem: ( replay: ValidatedReplay ) => void;
    clearReplayQueue: () => void;
    flushWatchedReplays: () => void;
    updateNextReplay: () => void;
    loadNextReplay: () => Promise<void>;
    loadMap: ( file: File ) => Promise<void>;
}

export const useReplayAndMapStore = create<ReplayAndMapStore>( ( set, get ) => ( {
    totalGameTime: 0,
    replayQueue: [],
    replayIndex: -1,
    async loadMap( file: File ) {
        await sceneStore().execSceneLoader( homeSceneLoader, "@home", {
            ignoreSameScene: true,
        } );

        get().clearReplayQueue();

        void sceneStore().execSceneLoader( () => mapSceneLoader( file ), "@map", {
            errorHandler: {
                loader: homeSceneLoader,
                id: "@home",
            },
        } );
    },
    async loadNextReplay() {
        if ( get().getNextReplay() === undefined ) {
            return;
        }

        await sceneStore().execSceneLoader( homeSceneLoader, "@home", {
            ignoreSameScene: true,
        } );

        await sceneStore().execSceneLoader( () => replaySceneLoader(  get().getNextReplay()! ), "@replay", {
            errorHandler: {
                loader: homeSceneLoader,
                id: "@home",
            }
        } );

        get().updateNextReplay();
    },
    getNextReplay() {
        return get().replayQueue[get().replayIndex + 1];
    },
    updateNextReplay() {
        set( { replayIndex: get().replayIndex + 1 } );
    },
    addReplaysToQueue: ( replays: ValidatedReplay[] ) => {
        set( { replayQueue: [ ...get().replayQueue, ...replays ] } );
    },
    addReplayToQueue: ( replay: ValidatedReplay ) => {
        set( { replayQueue: [ ...get().replayQueue, replay ] } );
    },
    deleteReplayQueueItem: ( replay: ValidatedReplay ) => {
        const replayQueue = get().replayQueue;
        set( { replayQueue: replayQueue.filter( ( r ) => r !== replay ) } );
    },
    clearReplayQueue: () => {
        set( { replayQueue: [] } );
        set( { replayIndex: -1 } );
    },
    flushWatchedReplays: () => {
        set( { replayQueue: get().replayQueue.slice( get().replayIndex ) } );
    },
    addToTotalGameTime( t: number ) {
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
