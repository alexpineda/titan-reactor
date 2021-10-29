import create from "zustand";

// loading store which contains state on loading status, as well as loaded replay and map data
export const ASSETS_MAX = 1010;
export const MAP_GENERATION_MAX = 50;

type BaseProcess = {
  id: string,
  label: string,
  priority: number,
};

type DeterminateProcess = BaseProcess & {
  max:  number,
  current: number,
  mode: "determinate"
};

type Process = BaseProcess | DeterminateProcess;

type LoadingStore = {
  initialized: boolean;
  isReplay: boolean;
  isGame: boolean;
  isMap: boolean;
  chk: { filename?: string; loading?: boolean; loaded?: boolean };
  rep: { filename?: string; loading?: boolean; loaded?: boolean };
  completedProcesses: Process[];
  processes: Process[];
  startProcess: (process: Process) => void;
  updateProcess: (id: string, current?: number) => void;
  updateIndeterminateProcess: (id: string, label: string) => void;
  completeProcess: (id: string) => void;
  isProcessComplete: (id:string) => boolean;
  initRep: (filename: string) => void;
  updateRep: (rep: any) => void;
  initChk: (filename: string) => void;
  updateChk: (chk: any) => void;
  completeRep: () => void;
  completeChk: () => void;
  reset: () => void;
};

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  isReplay: false,
  isGame: false,
  isMap: false,
  chk: { filename: "", loaded: false },
  rep: { filename: "", loaded: false },
  completedProcesses: [],
  processes: [],
  startProcess: (process:Process) => {
    set(({processes, completedProcesses}) => ({
      processes: [...processes, process],
      completedProcesses: completedProcesses.filter(p => p.id !== process.id),
    }));

  },
  updateProcess: (id: string, current?: number) => 
    set(state => (
      {processes: (state.processes as DeterminateProcess[]).map(p => 
        (p.id === id ? {...p, current: current ?? p.current + 1} : p) 
      )})),
  updateIndeterminateProcess: (id: string, label: string) => 
  set(state => (
    {processes: (state.processes as BaseProcess[]).map(p => 
      (p.id === id ? {...p, label} : p) 
    )})),
  completeProcess: (id: string) => {
    const process = get().processes.find(p => p.id === id);
    if (!process) return;
     set(({processes, completedProcesses}) => ({
       processes: processes.filter(p => p.id !== id),
       completedProcesses: [...completedProcesses, process]
      }));
  },
  isProcessComplete: (id:string) => get().completedProcesses.some(p => p.id === id),
  initRep: (filename: string) =>
    set({ rep: { filename, loading: true }, chk: {} }),
  updateRep: (data: any) =>
    set((state) => ({ rep: { ...state.rep, ...data } })),
  updateChk: (data: any) =>
    set((state) => ({ chk: { ...state.chk, ...data } })),
  initChk: (filename: string) =>
    set({ chk: { filename, loading: true }, rep: {} }),
  completeRep: () =>
    set((state) => ({ rep: { ...state.rep, loaded: true, loading: false } })),
  completeChk: () =>
    set((state) => ({ chk: { ...state.chk, loaded: true, loading: false } })),
  reset: () => set({ chk: {}, rep: {} }),
  initialized: false,
}));

export default useLoadingStore;

export const startLoadingProcess = useLoadingStore.getState().startProcess;
export const updateLoadingProcess = useLoadingStore.getState().updateProcess;
export const updateIndeterminateLoadingProcess = useLoadingStore.getState().updateIndeterminateProcess;
export const completeLoadingProcess = useLoadingStore.getState().completeProcess;
export const isLoadingProcessComplete = useLoadingStore.getState().isProcessComplete;
