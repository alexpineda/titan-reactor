import create from "zustand/vanilla";
import * as log from "@ipc/log";
import { MathUtils } from "three";

const PROCESS_MAX = 10;

export type IncrementalProcess = {
  id: string;
  label: string;
  max: number;
  current: number;
};

export type ProcessStore = {
  processes: IncrementalProcess[];
  create: (label: string, max?: number) => { id: string, increment: () => void, complete: () => void, add(additiona: number): void };
  increment: (id: string, current?: number) => void;
  forceComplete: (id: string) => void;
  isComplete: (id: string) => boolean;
  isInProgress: (id: string) => boolean;
  getTotalProgress: () => number;
  clearCompleted: () => void;
  clearAll: () => void;
};

export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: [],
  create: (label: string, max = PROCESS_MAX) => {
    const id = MathUtils.generateUUID();
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);
    log.verbose("@process/init: " + label);

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

    return {
      id,
      increment: () => get().increment(id),
      complete: () => get().forceComplete(id),
      add: (additional: number) => {
        process.max += additional;
      }
    }
  },
  increment: (id: string, step = 1) => {
    const process = get().processes.find((p) => p.id === id);

    if (process) {
      const next = Math.min(process.current + step, process.max);

      if (process.current >= process.max) {
        get().forceComplete(id)
      } else {
        set((state) => ({
          processes: (state.processes as IncrementalProcess[]).map(
            (p) => (p.id === id ? { ...p, current: next } : p)
          ),
        }));
      }
    }
  },
  forceComplete: (id: string, clear = true) => {
    if (get().isComplete(id)) {
      return;
    }
    if (!get().isInProgress(id)) {
      log.error(`@process/complete: process ${id} is not in progress`);
      return;
    }

    const perf = performance.measure(`process-${id}`);
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);

    const { label } = get().processes.find((p) => p.id === id)!;

    log.info(`@process/complete: ${label} ${perf.duration}ms`);

    const process = get().processes.find((p) => p.id === id);
    if (!process) return;

    process.current = process.max;

    if (clear) {
      set(({ processes }) => ({
        processes: processes.filter((p) => p.id !== id)
      }));
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
    get().processes.some((p) => p.id === id),
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