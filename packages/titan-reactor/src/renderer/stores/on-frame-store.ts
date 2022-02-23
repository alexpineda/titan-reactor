// convenience store for plugin subscriptions
import create from "zustand/vanilla";

export type OnFrameStore = {
    friendlyTime: string,
    currentFrame: number,
    maxFrame: number,
};

export const useOnFrameStore = create<OnFrameStore>((set, get) => ({
    friendlyTime: "",
    currentFrame: 0,
    maxFrame: 0
}));

export default () => useOnFrameStore.getState();

