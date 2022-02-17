import {
    useLoadingStore,
} from "../stores";
import gameStore from "../stores/game-store";
import processStore, { Process } from "../stores/process-store";
import { EmptyFunc } from "../../common/types";
import * as log from "../ipc";


export default async () => {
    log.info("waiting for assets");
    return await new Promise((res: EmptyFunc) => {
        if (processStore().isComplete(Process.AssetLoading)) {
            const assets = gameStore().assets;
            if (!assets) {
                log.error("assets not loaded");
                throw new Error("assets not loaded");
            }
            res();
            return;
        }
        const unsub = useLoadingStore.subscribe(() => {
            if (processStore().isComplete(Process.AssetLoading)) {
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