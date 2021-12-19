import { ipcRenderer } from "electron";

import {
  LOAD_REPLAY_FROM_FILE,
  REQUEST_NEXT_FRAMES,
  STOP_READING_GAME_STATE,
} from "../../common/ipc-handle-names";

export const requestNextFrames = async (minFrames: number) => {
  return await ipcRenderer.invoke(REQUEST_NEXT_FRAMES, minFrames);
};

export const stopReadingGameState = async () => {
  return await ipcRenderer.invoke(STOP_READING_GAME_STATE);
};

export const loadReplayFromFile = async (
  repFile: string,
  outFile: string,
  starcraftPath: string
) => {
  return await ipcRenderer.invoke(
    LOAD_REPLAY_FROM_FILE,
    repFile,
    outFile,
    starcraftPath
  );
};
