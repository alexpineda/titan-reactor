// convenience store for plugin subscriptions
import Chk from "bw-chk";
import { Replay } from "../../process-replay/parse-replay";
import create from "zustand/vanilla";

export type WorldStore = {
    map?: Chk,
    replay?: Replay,
};

export const useWorldStore = create<WorldStore>(() => ({
}));

export default () => useWorldStore.getState();

