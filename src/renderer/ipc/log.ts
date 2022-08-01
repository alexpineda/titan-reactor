import { ipcRenderer } from "electron";
import { LOG_MESSAGE } from "common/ipc-handle-names";

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

export const verbose = (msg: string) => {
  log(msg, "verbose");
}

export const log = async (message: string, level: "info" | "warning" | "error" | "verbose" = "info") => {
  logClient(message, level);
  ipcRenderer.send(LOG_MESSAGE, { level, message });
};

export const logClient = (message: string, level: "info" | "warning" | "error" | "verbose" = "info") => {
  if (level === "error") {
    console.error(message);
  } else if (level === "warning") {
    console.warn(message);
  } else if (level === "verbose") {
    console.log(message);
  }

}