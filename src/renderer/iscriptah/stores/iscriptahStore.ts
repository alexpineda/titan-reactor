import { gameSpeeds } from "common/utils/conversions";
import create from "zustand";
import { Euler, Vector3 } from "three";

//a user settings store which persists to disk
export type IScriptahStore = {
  criticalError: boolean;
  setCriticalError: (criticalError: boolean) => void;

  error: any;
  setError: (error: any) => void;

  gameTick: number;
  setGameTick: (gameTick: number) => void;
  incGameTick: () => void;

  unitImageTab: string;
  setUnitImageTab: (unitImageTab: string) => void;

  autoUpdate: boolean;
  setAutoupdate: (value: boolean) => void;

  gamespeed: number;
  setGamespeed: (value: number) => void;

  renderMode: "sd" | "hd" | "3d";
  setRenderMode: (value: "sd" | "hd" | "3d") => void;

  exposure: number;
  setExposure: (value: number) => void;

  cameraDirection: number;
  setCameraDirection: (value: number) => void;

  transform: "" | "rotate" | "translate" | "scale";
  setTransform: (value: "" | "rotate" | "translate" | "scale") => void;

  transformEnabled: {
    x: boolean;
    y: boolean;
    z: boolean;
  };
  setTransformEnabledX: (value: boolean) => void;
  setTransformEnabledY: (value: boolean) => void;
  setTransformEnabledZ: (value: boolean) => void;

  showFloorAxes: boolean;
  setShowFloorAxes: (value: boolean) => void;

  transformVector?: Vector3 | Euler | null;
  setTransformVector: (value?: Vector3 | Euler | null) => void;
};

export const useIScriptahStore = create<IScriptahStore>((set) => ({
  criticalError: false,
  setCriticalError: (criticalError: boolean) => set({ criticalError }),
  error: null,
  setError: (error: any) => set({ error }),
  gameTick: 0,
  setGameTick: (gameTick: number) => set({ gameTick }),
  incGameTick: () =>
    set((state) => {
      state.gameTick + 1;
    }),
  unitImageTab: "units",
  setUnitImageTab: (unitImageTab: string) => set({ unitImageTab }),
  autoUpdate: true,
  setAutoupdate: (value) => set({ autoUpdate: value }),
  gamespeed: gameSpeeds.fastest,
  setGamespeed: (value) => set({ gamespeed: value }),
  renderMode: "hd",
  setRenderMode: (value) => set({ renderMode: value }),
  exposure: 2.2,
  setExposure: (value) => set({ exposure: value }),
  cameraDirection: 0,
  setCameraDirection: (value) => set({ cameraDirection: value }),
  transform: "",
  setTransform: (value) => set({ transform: value }),
  transformEnabled: {
    x: true,
    y: true,
    z: true,
  },
  setTransformEnabledX: (value) => {
    set((state) => ({
      transformEnabled: {
        ...state.transformEnabled,
        x: value,
      },
    }));
  },
  setTransformEnabledY: (value) => {
    set((state) => ({
      transformEnabled: {
        ...state.transformEnabled,
        y: value,
      },
    }));
  },
  setTransformEnabledZ: (value) => {
    set((state) => ({
      transformEnabled: {
        ...state.transformEnabled,
        z: value,
      },
    }));
  },

  showFloorAxes: true,
  setShowFloorAxes: (value) => set({ showFloorAxes: value }),

  transformVector: null,
  setTransformVector: (value) => set({ transformVector: value }),
}));

export default useIScriptahStore;

export const setAutoupdate = useIScriptahStore.getState().setAutoupdate;
export const setGamespeed = useIScriptahStore.getState().setGamespeed;
export const setRenderMode = useIScriptahStore.getState().setRenderMode;
export const setExposure = useIScriptahStore.getState().setExposure;
export const setCameraDirection =
  useIScriptahStore.getState().setCameraDirection;
export const setTransform = useIScriptahStore.getState().setTransform;
export const setTransformEnabledX =
  useIScriptahStore.getState().setTransformEnabledX;
export const setTransformEnabledY =
  useIScriptahStore.getState().setTransformEnabledY;
export const setTransformEnabledZ =
  useIScriptahStore.getState().setTransformEnabledZ;
export const setUnitImageTab = useIScriptahStore.getState().setUnitImageTab;
export const setGameTick = useIScriptahStore.getState().setGameTick;
export const incGameTick = useIScriptahStore.getState().incGameTick;
export const setShowFloorAxes = useIScriptahStore.getState().setShowFloorAxes;
export const setTransformVector =
  useIScriptahStore.getState().setTransformVector;
