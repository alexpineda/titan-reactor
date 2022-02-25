// convenience store for plugin subscriptions
import create from "zustand/vanilla";

/**
 * We're calling this GameTick but it's really every game second.
 * This is to be consumed by plugins looking to update semi-realtime.
 */
export type GameTickStore = {
    friendlyTime: string,
    currentFrame: number,
    maxFrame: number,
};

export const useGameTickStore = create<GameTickStore>(() => ({
    friendlyTime: "",
    currentFrame: 0,
    maxFrame: 0
}));

export default () => useGameTickStore.getState();

