import {
    useProcessStore,
} from "../stores";
import gameStore from "../stores/game-store";
import processStore, { Process } from "../stores/process-store";
import * as log from "../ipc";
import Assets from "../assets/assets";


export default async (): Promise<Assets> => {
    return await new Promise((res: (value: Assets) => void) => {
        if (processStore().isComplete(Process.AtlasPreload)) {
            const assets = gameStore().assets;
            if (!assets) {
                log.error("assets not loaded");
                throw new Error("assets not loaded");
            }
            res(assets);
            return;
        }
        const unsub = useProcessStore.subscribe(() => {
            if (processStore().isComplete(Process.AtlasPreload)) {
                unsub();
                const assets = gameStore().assets;
                if (!assets) {
                    log.error("assets not loaded");
                    throw new Error("assets not loaded");
                }
                res(assets);
            }
        });
    });
};