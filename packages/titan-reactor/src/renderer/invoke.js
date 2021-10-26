import { ipcRenderer } from "electron";
import {
  OPEN_FILE,
  OPEN_DATA_FILE,
  LOAD_ALL_DATA_FILES,
  SET_SETTINGS,
  GET_SETTINGS,
  SELECT_FOLDER,
  LOG_MESSAGE,
  EXIT,
  LOAD_REPLAY_FROM_FILE,
  REQUEST_NEXT_FRAMES,
  STOP_READING_GAME_STATE,
  LOAD_CHK,
  LOAD_SCX,
} from "../common/ipc/handleNames";
import { Buffer } from "buffer/";

export const openFile = async (filepath) => {
  const result = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return new Buffer(result);
};

export const openDataFile = async (filepath) => {
  const result = await ipcRenderer.invoke(OPEN_DATA_FILE, filepath);
  return new Buffer(result);
};

export const loadAllDataFiles = async (bwDataPath) => {
  return Object.freeze(
    await ipcRenderer.invoke(LOAD_ALL_DATA_FILES, bwDataPath)
  );
};

export const selectFolder = async (key) => {
  return await ipcRenderer.send(SELECT_FOLDER, key);
};

export const getSettings = async () => {
  return await ipcRenderer.invoke(GET_SETTINGS);
};

export const saveSettings = async (settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};

export const log = async (message, level = "info") => {
  //@todo add isDev mode check
  // if (level === "error") {
  //   console.error(message);
  // } else if (level === "warn") {
  //   console.warn(message);
  // } else {
  //   console.log(message);
  // }

  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};

export const loadReplayFromFile = async (repFile, outFile, starcraftPath) => {
  return await ipcRenderer.invoke(
    LOAD_REPLAY_FROM_FILE,
    repFile,
    outFile,
    starcraftPath
  );
};

export const requestNextFrames = async (minFrames) => {
  return await ipcRenderer.invoke(REQUEST_NEXT_FRAMES, minFrames);
};

export const stopReadingGameState = async () => {
  return await ipcRenderer.invoke(STOP_READING_GAME_STATE);
};

export const loadScx = async (buf) => {
  return await ipcRenderer.invoke(LOAD_SCX, buf);
};

export const loadChk = async (buf) => {
  return await ipcRenderer.invoke(LOAD_CHK, buf);
};

export const exit = () => {
  ipcRenderer.send(EXIT);
};
