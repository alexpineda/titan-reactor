import { snake } from "common/utils/camel";
import create from "zustand";
import * as log from "../ipc/log";

const PROCESS_MAX = 10;

export enum Process {
  TerrainGeneration,
  IScriptahInitialization,
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
  complete: (id: Process, affix?: string) => void;
  isComplete: (id: Process) => boolean;
  isInProgress: (id: Process) => boolean;
};

export const useLoadingStore = create<ProcessStore>((set, get) => ({
  completedProcesses: [],
  processes: [],
  start: (id: Process, max = PROCESS_MAX) => {
    log.info("@process/init: " + snake(Process[id]));

    performance.mark(`process-${id}`);

    const process = {
      id,
      current: 0,
      max
    }

    set(({ processes, completedProcesses }) => ({
      processes: [...processes, process],
      completedProcesses: completedProcesses.filter((p) => p.id !== id),
    }));

  },
  increment: (id: Process, current?: number) => {
    const process = get().processes.find((p) => p.id === id);
    if (process) {
      const next = Math.min(process.current++, process.max);

      log.verbose("@process/" + snake(Process[id]) + ": " + (next / process.max).toFixed(2));

      set((state) => ({
        processes: (state.processes as LoadingStoreDeterminateProcess[]).map(
          (p) => (p.id === id ? { ...p, current: current ?? next } : p)
        ),
      }));
    }
  },
  complete: (id: Process) => {
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

export default () => useLoadingStore.getState();