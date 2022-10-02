import { gameSpeeds } from "common/utils/conversions";
import create from "zustand";

export type IScriptahStore = {

  error: any;

  gameTick: number;

  unitImageTab: string;

  autoUpdate: boolean;

  gamespeed: number;

  cameraDirection: number;

};

export const useIScriptahStore = create<IScriptahStore>(() => ({

  error: null,
  gameTick: 0,
  unitImageTab: "units",
  autoUpdate: true,
  gamespeed: gameSpeeds.fastest,
  cameraDirection: 0,

}));

export const setAutoupdate = (autoUpdate: boolean) => useIScriptahStore.setState({ autoUpdate });

export const setGamespeed = (gamespeed: number) => useIScriptahStore.setState({ gamespeed });

export const setError = (error: Error) => useIScriptahStore.setState({ error });

export const setCameraDirection = (cameraDirection: number) => useIScriptahStore.setState({ cameraDirection });

export const setUnitImageTab = (unitImageTab: string) => useIScriptahStore.setState({ unitImageTab });

export const setGameTick = (gameTick: number) => useIScriptahStore.setState({ gameTick });

export const incGameTick = () =>
  useIScriptahStore.setState((state) => ({
    gameTick: state.gameTick + 1
  }))
