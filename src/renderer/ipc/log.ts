import { ipcRenderer } from "electron";
import { LOG_MESSAGE } from "common/ipc-handle-names";

type ErrorOrUnknown = Error | unknown;
export type LogType = "info" | "warning" | "error" | "verbose" | "debug";

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

export const debug = (msg: string) => {
  log(msg, "debug");
}

export const log = async (message: string, level: LogType = "info") => {
  logClient(message, level);
  ipcRenderer.send(LOG_MESSAGE, { level, message });
};

export const logClient = (message: string, level: LogType = "info") => {
  if (level === "error") {
    console.error(message);
  } else if (level === "warning") {
    console.warn(message);
  } else if (level === "verbose" || level === "info") {
    console.log(message);
  } else if (level === "debug") {
    console.debug(message);
  }

}