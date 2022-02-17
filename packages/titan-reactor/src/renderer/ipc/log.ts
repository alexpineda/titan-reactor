import { ipcRenderer } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";
import { useSettingsStore } from "../stores";
import gameStore from "../stores/game-store";

type ErrorOrUnknown = Error | unknown;

export const error = (msg: string | ErrorOrUnknown) => {
  if (typeof msg === "string") {
    log(msg, "error");
  } else {
    log((msg as Error)?.message);
  }
};

export const warning = (msg: string) => {
  log(msg, "warning");
};

export const info = (msg: string) => {
  log(msg, "info");
};

export const debug = (msg: string) => {
  log(msg, "debug");
}

export const verbose = (msg: string) => {
  log(msg, "verbose");
}

// @todo return early if disabled
export const log = async (message: string, level = "info") => {
  if (level === "error") {
    gameStore().addLog(message, "red");
    console.trace(message);
  } else if (level === "warning") {
    gameStore().addLog(message, "yellow");
    console.warn(message);
  } else {
    gameStore().addLog(message);
    console.log(message);
  }

  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};
