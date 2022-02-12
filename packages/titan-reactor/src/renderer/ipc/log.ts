import { ipcRenderer } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";
import { useSettingsStore } from "../stores";

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
  const logDiv = document.getElementById("log");
  const p = document.createElement("p");
  p.textContent = message;

  if (level === "error") {
    p.style.color = "red";
    console.trace(message);
  } else if (level === "warning") {
    p.style.color = "yellow";
    console.warn(message);
  } else {
    console.log(message);
  }
  logDiv?.appendChild(p);

  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};
