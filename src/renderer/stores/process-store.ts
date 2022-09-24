import create from "zustand/vanilla";
import { log } from "@ipc/log";
import { MathUtils } from "three";

const PROCESS_MAX = 10;

export type IncrementalProcess = {
  id: string;
  label: string;
  max: number;
  current: number;
};

type ProcessWrapper = { id: string, increment: () => void, add(additiona: number): void };

export type ProcessStore = {
  processes: IncrementalProcess[];
  create: (label: string, max: number) => ProcessWrapper;
  increment: (id: string, current?: number) => void;
  isComplete: (id: string) => boolean;
  isInProgress: (id: string) => boolean;
  getTotalProgress: () => number;
  clearCompleted: () => void;
  clearAll: () => void;
  addOrCreate: (label: string, max: number) => ProcessWrapper;
  _createProcessWrapper: (id: string, process: IncrementalProcess) => ProcessWrapper;
};


export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: [],
  _createProcessWrapper: (id: string, process: IncrementalProcess) => ({
    id,
    increment: () => get().increment(id),
    add: (additional: number) => {
      process.max += additional;
    }
  }),
  create: (label: string, max = PROCESS_MAX) => {
    const id = MathUtils.generateUUID();
    log.debug("@process/init: " + label);

    performance.mark(`process-${id}`);

    const process = {
      label,
      id,
      current: 0,
      max
    };

    set(({ processes }) => ({
      processes: [...processes, process],
    }));

    return get()._createProcessWrapper(id, process);
  },
  addOrCreate: (label: string, max: number) => {
    const existing = get().processes[0];
    if (existing) {
      performance.mark(`process-${existing.id}`);
      existing.max += max;
      return get()._createProcessWrapper(existing.id, existing);
    } else {
      return get().create(label, max);
    }
  },

  increment: (id: string, step = 1) => {
    const process = get().processes.find((p) => p.id === id);

    if (process) {
      const next = Math.min(process.current + step, process.max);

      set((state) => ({
        processes: (state.processes as IncrementalProcess[]).map(
          (p) => (p.id === id ? { ...p, current: next } : p)
        ),
      }));

      if (next === process.max) {
        const perf = performance.measure(`process-${id}`);
        performance.clearMarks(`process-${id}`);
        performance.clearMeasures(`process-${id}`);
        log.info(`@process/complete: ${process.label} ${perf.duration}ms`);
      }
    }
  },
  clearAll: () => {
    set({
      processes: []
    })
  },
  clearCompleted() {
    set(({ processes }) => ({
      processes: processes.filter((p) => !get().isComplete(p.id))
    }));
  },
  isInProgress: (id: string) =>
    get().processes.some((p) => p.id === id && p.current < p.max),
  isComplete: (id: string) =>
    get().processes.some((p) => p.id === id && p.current >= p.max),
  getTotalProgress: () => {
    const total = get().processes.reduce((acc, p) => acc + p.max, 0);
    const process = get().processes.reduce((acc, p) => acc + p.current, 0);
    const t = total > 0 ? process / total : 0;
    return t;
  }
}));

export default () => useProcessStore.getState();