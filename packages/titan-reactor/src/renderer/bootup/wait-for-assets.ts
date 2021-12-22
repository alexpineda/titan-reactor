import {
    getAssets,
    isLoadingProcessComplete,
    useLoadingStore,
} from "../stores";

import { EmptyFunc } from "../../common/types";
import { log } from "../ipc";


export default async () => {
    log("waiting for assets");
    return await new Promise((res: EmptyFunc) => {
        if (isLoadingProcessComplete("assets")) {
            const assets = getAssets();
            if (!assets || !assets.bwDat) {
                throw new Error("assets not loaded");
            }
            res();
            return;
        }
        const unsub = useLoadingStore.subscribe(() => {
            if (isLoadingProcessComplete("assets")) {
                unsub();
                const assets = getAssets();
                if (!assets || !assets.bwDat) {
                    throw new Error("assets not loaded");
                }
                res();
            }
        });
    });
};