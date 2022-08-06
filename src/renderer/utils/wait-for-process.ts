import {
    useProcessStore,
} from "../stores";
import processStore, { Process } from "../stores/process-store";

export const waitForSeconds = (seconds: number) => new Promise((res) => setTimeout(() => res(null), seconds * 1000))

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

export function waitForTruthy<T>(fn: Function, polling = 100): Promise<T> {
    return new Promise((res) => {
        const r = fn();
        if (r) {
            res(r);
            return;
        }
        const _t = setInterval(() => {
            const r = fn();
            if (r) {
                res(r);
                clearInterval(_t);
                return;
            }
        }, polling);
    });
}