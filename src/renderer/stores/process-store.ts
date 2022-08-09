import { snake } from "common/utils/camel";
import create from "zustand";
import * as log from "@ipc/log";

const PROCESS_MAX = 10;

export enum Process {
  ReplayInitialization,
  MapInitialization,
  AtlasPreload
}

export type LoadingStoreBaseProcess = {
  id: Process;
  max: number;
};

export type LoadingStoreDeterminateProcess = LoadingStoreBaseProcess & {
  current: number;
};

export type LoadingStoreProcess = LoadingStoreDeterminateProcess;

export type ProcessStore = {
  completedProcesses: LoadingStoreProcess[];
  processes: LoadingStoreProcess[];
  add: (id: Process, count: number) => void;
  start: (id: Process, max?: number) => { increment: () => void, complete: () => void };
  increment: (id: Process, current?: number) => void;
  complete: (id: Process) => void;
  isComplete: (id: Process) => boolean;
  isInProgress: (id: Process) => boolean;
  hasAnyProcessIncomplete: () => boolean;
  getTotalProgress: () => number;
};

const _timerDebug: Record<number, NodeJS.Timeout> = {};

export const useProcessStore = create<ProcessStore>((set, get) => ({
  completedProcesses: [],
  processes: [],
  hasAnyProcessIncomplete: () => get().processes.length > 0,
  add(id: Process, count: number) {
    const process = get().processes.find(p => p.id === id);
    if (!process) {
      log.warning(`Process ${id} does not exist. Can't add to it`);
    }
    process!.max + count;
    set(({ processes }) => ({
      processes: [...processes],
    }));
  },
  start: (id: Process, max = PROCESS_MAX) => {
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);
    clearTimeout(_timerDebug[id]);
    _timerDebug[id] = setTimeout(() => {
      log.error(`@process/start: Process ${Process[id]} timed out`);
      get().complete(id)
    }, 60000);
    log.verbose("@process/init: " + snake(Process[id]));

    performance.mark(`process-${id}`);

    const exists = get().processes.find(p => p.id === id);
    if (exists) {
      log.warning("@process/start: process already exists - will restart");
      exists.current = 0;
      exists.max = max;
    }

    set(({ processes, completedProcesses }) => ({
      processes: exists ? [...processes] : [...processes, {
        id,
        current: 0,
        max
      }],
      completedProcesses: completedProcesses.filter((p) => p.id !== id),
    }));
    return {
      increment: () => get().increment(id),
      complete: () => get().complete(id),
    }
  },
  increment: (id: Process, current?: number) => {
    clearTimeout(_timerDebug[id]);
    _timerDebug[id] = setTimeout(() => {
      log.error(`@process/increment: Process ${Process[id]} timed out`);
      get().complete(id)
      performance.clearMarks(`process-${id}`);
      performance.clearMeasures(`process-${id}`);
    }, 10000);
    const process = get().processes.find((p) => p.id === id);

    if (process) {
      const next = Math.min(++process.current, process.max);

      if (process.current === process.max) {
        get().complete(id)
      } else {
        set((state) => ({
          processes: (state.processes as LoadingStoreDeterminateProcess[]).map(
            (p) => (p.id === id ? { ...p, current: current ?? next } : p)
          ),
        }));
      }
    }
  },
  complete: (id: Process) => {
    clearTimeout(_timerDebug[id]);
    if (get().isComplete(id)) {
      return;
    }
    if (!get().isInProgress(id)) {
      log.error(`@process/complete: process ${Process[id]} is not in progress`);
      return;
    }

    const perf = performance.measure(`process-${id}`);
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);

    log.info(`@process/complete: ${snake(Process[id])} ${perf.duration}ms`);

    const process = get().processes.find((p) => p.id === id);
    if (!process) return;

    set(({ processes, completedProcesses }) => ({
      processes: processes.filter((p) => p.id !== id),
      completedProcesses: [...completedProcesses, process],
    }));
  },
  isInProgress: (id: Process) =>
    get().processes.some((p) => p.id === id),
  isComplete: (id: Process) =>
    get().completedProcesses.some((p) => p.id === id),
  getTotalProgress: () => {
    const total = get().processes.reduce((acc, p) => acc + p.max, 0);
    const process = get().processes.reduce((acc, p) => acc + p.current, 0);
    const t = total > 0 ? process / total : get().completedProcesses.length ? 1 : 0;
    return t;
  }
}));

export default () => useProcessStore.getState();