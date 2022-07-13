import {
    useProcessStore,
} from "../stores";
import processStore, { Process } from "../stores/process-store";

export const waitForProcess = (process: Process) => {
    return new Promise((res) => {
        if (processStore().isComplete(process)) {
            res(null);
            return;
        }
        const unsub = useProcessStore.subscribe(() => {
            if (processStore().isComplete(process)) {
                unsub();
                res(null);
            }
        });
    });
}