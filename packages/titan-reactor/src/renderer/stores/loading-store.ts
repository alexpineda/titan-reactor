import create from "zustand";
import { ReplayPlayer } from "../../common/types";
import * as log from "../ipc/log";

// loading store which contains state on loading status, as well as loaded replay and map data
export const ASSETS_MAX = 1010;
export const MAP_GENERATION_MAX = 50;

export type LoadingStoreBaseProcess = {
  id: string;
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

type BaseScreen = {
  type: "map" | "replay" | "iscriptah" | "home";
  loading?: boolean;
  loaded?: boolean;
  error?: Error;
};

export type MapScreen = BaseScreen & {
  type: "map";
  filename?: string;
  title?: string;
  description?: string;
};

export type ReplayScreen = BaseScreen & {
  type: "replay";
  filename?: string;
  header?: {
    players: ReplayPlayer[];
  };
  chkTitle?: string;
};

export type IScriptahScreen = BaseScreen & {
  type: "iscriptah";
};

export type HomeScreen = BaseScreen & {
  type: "home";
};

export type UIType = MapScreen | ReplayScreen | IScriptahScreen | HomeScreen;

export type LoadingStore = {
  isReplay: boolean;
  isGame: boolean;
  isMap: boolean;
  screen: UIType;
  initScreen: (value: UIType) => void;
  updateScreen: <T extends BaseScreen>(value: T) => void;
  completeScreen: () => void;
  errorScreen: (error: Error) => void;
  completedProcesses: LoadingStoreProcess[];
  processes: LoadingStoreProcess[];
  startProcess: (process: LoadingStoreProcess) => void;
  updateProcess: (id: string, current?: number) => void;
  updateIndeterminateProcess: (id: string, label: string) => void;
  completeProcess: (id: string, affix?: string) => void;
  isProcessComplete: (id: string) => boolean;
  isProcessInProgress: (id: string) => boolean;
};

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  screen: { type: "home", loaded: false, loading: true },
  initScreen: (value) =>
    set({
      screen: {
        loading: true,
        loaded: false,
        ...value,
      },
    }),
  updateScreen: (value) =>
    set((state) => ({ screen: { ...state.screen, ...value } })),
  completeScreen: () =>
    set(({ screen }) => ({
      screen: { ...screen, loaded: true, loading: false },
    })),
  errorScreen: (error) =>
    set((state) => ({
      screen: { ...state.screen, error, loaded: false, loading: false },
    })),
  completedProcesses: [],
  processes: [],
  startProcess: (process: LoadingStoreProcess) => {
    log.info("process " + process.id + " start");
    performance.mark(`process-${process.id}`);
    set(({ processes, completedProcesses }) => ({
      processes: [...processes, process],
      completedProcesses: completedProcesses.filter((p) => p.id !== process.id),
    }));
  },
  updateProcess: (id: string, current?: number) => {
    log.verbose("process " + id + " update");
    set((state) => ({
      processes: (state.processes as LoadingStoreDeterminateProcess[]).map(
        (p) => (p.id === id ? { ...p, current: current ?? p.current + 1 } : p)
      ),
    }));
  },
  updateIndeterminateProcess: (id: string, label: string) =>
    set((state) => ({
      processes: (state.processes as LoadingStoreBaseProcess[]).map((p) =>
        p.id === id ? { ...p, label } : p
      ),
    })),
  completeProcess: (id: string) => {
    const perf = performance.measure(`process-${id}`);
    performance.clearMarks(`process-${id}`);
    performance.clearMeasures(`process-${id}`);
    log.info(`process ${id} complete ${perf.duration}ms`);
    const process = get().processes.find((p) => p.id === id);
    if (!process) return;
    set(({ processes, completedProcesses }) => ({
      processes: processes.filter((p) => p.id !== id),
      completedProcesses: [...completedProcesses, process],
    }));
  },
  isProcessInProgress: (id: string) =>
    get().processes.some((p) => p.id === id),
  isProcessComplete: (id: string) =>
    get().completedProcesses.some((p) => p.id === id),
}));

export default useLoadingStore;

export const startLoadingProcess = useLoadingStore.getState().startProcess;
export const updateLoadingProcess = useLoadingStore.getState().updateProcess;
export const updateIndeterminateLoadingProcess =
  useLoadingStore.getState().updateIndeterminateProcess;
export const completeLoadingProcess =
  useLoadingStore.getState().completeProcess;
export const isProcessComplete =
  useLoadingStore.getState().isProcessComplete;
export const isProcessInProgress =
  useLoadingStore.getState().isProcessInProgress;
export const initScreen = useLoadingStore.getState().initScreen;
export const updateScreen = useLoadingStore.getState().updateScreen;
export const completeScreen = useLoadingStore.getState().completeScreen;
export const errorScreen = useLoadingStore.getState().errorScreen;
