import create from "zustand";
import * as log from "../ipc/log";

// loading store which contains state on loading status, as well as loaded replay and map data
export const ASSETS_MAX = 1010;
export const MAP_GENERATION_MAX = 50;
export enum Process {
  TerrainGeneration,
  IScriptahInitialization,
  ReplayInitialization,
  MapInitialization,
  AssetLoading
}

export type LoadingStoreBaseProcess = {
  id: Process;
  label: string;
  priority: number;
};

export type LoadingStoreDeterminateProcess = LoadingStoreBaseProcess & {
  max: number;
  current: number;
  mode: "determinate";
};

export type LoadingStoreProcess =
  | LoadingStoreBaseProcess
  | LoadingStoreDeterminateProcess;

const isDeterminateProcess = (process: any): process is LoadingStoreDeterminateProcess => {
  return process.max !== undefined;
}

export type ProcessStore = {
  completedProcesses: LoadingStoreProcess[];
  processes: LoadingStoreProcess[];
  init: (process: LoadingStoreProcess) => void;
  increment: (id: Process, current?: number) => void;
  updateIndeterminate: (id: Process, label: string) => void;
  complete: (id: Process, affix?: string) => void;
  isComplete: (id: Process) => boolean;
  isInProgress: (id: Process) => boolean;
};

export const useLoadingStore = create<ProcessStore>((set, get) => ({
  completedProcesses: [],
  processes: [],
  init: (process: LoadingStoreProcess) => {
    log.info("Initialize " + Process[process.id]);
    performance.mark(`process-${process.id}`);
    set(({ processes, completedProcesses }) => ({
      processes: [...processes, process],
      completedProcesses: completedProcesses.filter((p) => p.id !== process.id),
    }));
  },
  increment: (id: Process, current?: number) => {
    const process = get().processes.find((p) => p.id === id);
    if (process && isDeterminateProcess(process)) {
      log.verbose(Process[id] + " " + (process.current / process.max).toFixed(2));
      set((state) => ({
        processes: (state.processes as LoadingStoreDeterminateProcess[]).map(
          (p) => (p.id === id ? { ...p, current: current ?? p.current + 1 } : p)
        ),
      }));
    }
  },
  updateIndeterminate: (id: Process, label: string) =>
    set((state) => ({
      processes: (state.processes as LoadingStoreBaseProcess[]).map((p) =>
        p.id === id ? { ...p, label } : p
      ),
    })),
  complete: (id: Process) => {
    const perf = performance.measure(`process-${id}`);
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);
    log.info(`Complete ${Process[id]} ${perf.duration}ms`);
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