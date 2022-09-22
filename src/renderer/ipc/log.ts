import { ipcRenderer } from "electron";
import { LOG_MESSAGE } from "common/ipc-handle-names";

type ErrorOrUnknown = Error | unknown;
export type LogType = "info" | "warning" | "error" | "verbose" | "debug";


export const log = {
  error(msg: string | ErrorOrUnknown) {
    if (typeof msg === "string") {
      logBoth(msg, "error");
    } else {
      logBoth((msg as Error)?.message, "error");
    }
  },

  warn(msg: string) {
    logBoth(msg, "warning");
  },

  info(msg: string) {
    logBoth(msg, "info");
  },

  verbose(msg: string) {
    logBoth(msg, "verbose");
  },

  debug(msg: string) {
    logBoth(msg, "debug");
  }

};

export const logBoth = (message: string, level: LogType = "info") => {
  logClient(message, level);
  logServer(message, level);
}

export const logServer = async (message: string, level: LogType = "info") => {
  ipcRenderer.send(LOG_MESSAGE, { level, message });
}

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