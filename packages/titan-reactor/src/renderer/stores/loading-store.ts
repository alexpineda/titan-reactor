import create from "zustand";
import { ReplayPlayer } from "../../common/types";

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

type BaseUIType = {
  type: "map" | "replay" | "iscriptah" | "home";
  loading?: boolean;
  loaded?: boolean;
  error?: Error;
};

export type UITypeMap = BaseUIType & {
  type: "map";
  filename?: string;
  title?: string;
  description?: string;
};

export type UITypeReplay = BaseUIType & {
  type: "replay";
  filename?: string;
  header?: {
    players: ReplayPlayer[];
  };
  chkTitle?: string;
};

export type UITypeIscriptah = BaseUIType & {
  type: "iscriptah";
};

export type UITypeHome = BaseUIType & {
  type: "home";
};

export type UIType = UITypeMap | UITypeReplay | UITypeIscriptah | UITypeHome;

export type LoadingStore = {
  isReplay: boolean;
  isGame: boolean;
  isMap: boolean;
  screen: UIType;
  initUIType: (value: UIType) => void;
  updateUIType: <T extends BaseUIType>(value: T) => void;
  completeUIType: () => void;
  errorUIType: (error: Error) => void;
  completedProcesses: LoadingStoreProcess[];
  processes: LoadingStoreProcess[];
  startProcess: (process: LoadingStoreProcess) => void;
  updateProcess: (id: string, current?: number) => void;
  updateIndeterminateProcess: (id: string, label: string) => void;
  completeProcess: (id: string) => void;
  isProcessComplete: (id: string) => boolean;
  isProcessInProgress: (id: string) => boolean;
};

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  screen: { type: "home", loaded: false, loading: true },
  initUIType: (value) =>
    set({
      screen: {
        loading: true,
        loaded: false,
        ...value,
      },
    }),
  updateUIType: (value) =>
    set((state) => ({ screen: { ...state.screen, ...value } })),
  completeUIType: () =>
    set(({ screen }) => ({
      screen: { ...screen, loaded: true, loading: false },
    })),
  errorUIType: (error) =>
    set((state) => ({
      screen: { ...state.screen, error, loaded: false, loading: false },
    })),
  completedProcesses: [],
  processes: [],
  startProcess: (process: LoadingStoreProcess) => {
    set(({ processes, completedProcesses }) => ({
      processes: [...processes, process],
      completedProcesses: completedProcesses.filter((p) => p.id !== process.id),
    }));
  },
  updateProcess: (id: string, current?: number) =>
    set((state) => ({
      processes: (state.processes as LoadingStoreDeterminateProcess[]).map(
        (p) => (p.id === id ? { ...p, current: current ?? p.current + 1 } : p)
      ),
    })),
  updateIndeterminateProcess: (id: string, label: string) =>
    set((state) => ({
      processes: (state.processes as LoadingStoreBaseProcess[]).map((p) =>
        p.id === id ? { ...p, label } : p
      ),
    })),
  completeProcess: (id: string) => {
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
export const initUIType = useLoadingStore.getState().initUIType;
export const updateUIType = useLoadingStore.getState().updateUIType;
export const completeUIType = useLoadingStore.getState().completeUIType;
export const errorUIType = useLoadingStore.getState().errorUIType;
