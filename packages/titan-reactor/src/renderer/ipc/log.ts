import { ipcRenderer } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";
import { useSettingsStore } from "../stores";

export const error = (msg: string) => {
  log(msg, "error");
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
  // if (useSettingsStore.getState().isDev) {
    if (level === "error") {
      console.trace(message);
    } else if (level === "warning") {
      console.warn(message);
    } else {
      console.log(message);
    }
  // }

  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};
