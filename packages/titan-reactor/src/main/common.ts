import path from "path";

import { Settings } from "./Settings";
import { getUserDataPath } from "./userDataPath";
import createLogger from "./utils/logger";

export const logFilePath = path.join(getUserDataPath(), "logs", "app");

export const logger = createLogger(logFilePath, {
  logLevels: ["verbose", "info", "debug", "warning", "error"],
});

export const settings = new Settings();