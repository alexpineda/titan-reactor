import { snake } from "common/utils/camel";
import create from "zustand/vanilla";
import * as log from "../ipc/log";

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
  start: (id: Process, max?: number) => void;
  increment: (id: Process, current?: number) => void;
  complete: (id: Process) => void;
  isComplete: (id: Process) => boolean;
  isInProgress: (id: Process) => boolean;
  hasAnyProcessIncomplete: () => boolean;
};

const _timerDebug: Record<number, NodeJS.Timeout> = {};

export const useProcessStore = create<ProcessStore>((set, get) => ({
  completedProcesses: [],
  processes: [],
  hasAnyProcessIncomplete: () => get().processes.length > 0,
  start: (id: Process, max = PROCESS_MAX) => {
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);
    clearTimeout(_timerDebug[id]);
    _timerDebug[id] = setTimeout(() => {
      log.error(`@process/start: Process ${Process[id]} timed out`);
      get().complete(id)
    }, 10000);
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

      log.verbose("@process/" + snake(Process[id]) + ": " + (next / process.max).toFixed(2));

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
}));

export default () => useProcessStore.getState();