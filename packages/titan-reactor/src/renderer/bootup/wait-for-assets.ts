import {
    getAssets,
    isProcessComplete,
    useLoadingStore,
} from "../stores";

import { EmptyFunc } from "../../common/types";
import { log } from "../ipc";


export default async () => {
    log("waiting for assets");
    return await new Promise((res: EmptyFunc) => {
        if (isProcessComplete("assets")) {
            const assets = getAssets();
            if (!assets) {
                throw new Error("assets not loaded");
            }
            res();
            return;
        }
        const unsub = useLoadingStore.subscribe(() => {
            if (isProcessComplete("assets")) {
                unsub();
                const assets = getAssets();
                if (!assets) {
                    throw new Error("assets not loaded");
                }
                res();
            }
        });
    });
};