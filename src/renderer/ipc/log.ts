import { ipcRenderer } from "electron";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import { LogLevel } from "common/logging";
import { settingsStore } from "@stores/settings-store";

type ErrorOrUnknown = Error | unknown;

const logLevels = ["info", "warn", "error", "debug"];

const isActiveLevel = (level: LogLevel): boolean => {

  return logLevels.indexOf(level) <= logLevels.indexOf(settingsStore().data.utilities.logLevel);

}

export const log = {
  error(msg: string | ErrorOrUnknown) {
    if (typeof msg === "string") {
      logBoth(msg, "error");
    } else {
      logBoth((msg as Error)?.message, "error");
    }
  },

  warn(msg: string) {
    logBoth(msg, "warn");
  },

  info(msg: string) {
    logBoth(msg, "info");
  },

  debug(msg: string) {
    logBoth(msg, "debug");
  }

};

export const logBoth = (message: string, level: LogLevel = "info") => {
  logClient(message, level);
  logServer(message, level);
}

export const logServer = async (message: string, level: LogLevel = "info") => {

  if (isActiveLevel(level) === false) {
    return;
  }

  ipcRenderer.send(LOG_MESSAGE, { level, message });

}

export const logClient = (message: string, level: LogLevel = "info") => {

  if (isActiveLevel(level) === false) {
    return;
  }

  if (level === "error") {
    console.error(message);
  } else if (level === "warn") {
    console.warn(message);
  } else if (level === "info") {
    console.log(message);
  } else if (level === "debug") {
    console.debug(message);
  }

}