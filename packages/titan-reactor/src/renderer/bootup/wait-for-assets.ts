import {
    useLoadingStore,
} from "../stores";
import gameStore from "../stores/game-store";
import processStore, { Process } from "../stores/process-store";
import * as log from "../ipc";


export default async () => {
    log.info("waiting for assets");
    return await new Promise((res: (value?: unknown) => void) => {
        if (processStore().isComplete(Process.AtlasPreload)) {
            const assets = gameStore().assets;
            if (!assets) {
                log.error("assets not loaded");
                throw new Error("assets not loaded");
            }
            res();
            return;
        }
        const unsub = useLoadingStore.subscribe(() => {
            if (processStore().isComplete(Process.AtlasPreload)) {
                unsub();
                const assets = gameStore().assets;;
                if (!assets) {
                    log.error("assets not loaded");
                    throw new Error("assets not loaded");
                }
                res();
            }
        });
    });
};