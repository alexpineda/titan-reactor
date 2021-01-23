import path from "path";
import { getUserDataPath } from "./userDataPath";
import createLogger from "./utils/logger";

export const logFilePath = path.join(getUserDataPath(), "logs", "app");

export default createLogger(logFilePath, {
  logLevels: ["verbose", "info", "debug", "warning", "error"],
});
