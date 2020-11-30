import path from "path";
import { getUserDataPath } from "./userDataPath";
import createLogger from "./utils/logger";

const logFile = path.join(getUserDataPath(), "logs", "app");

export default createLogger(logFile, {
  logLevels: ["verbose", "info", "debug", "warning", "error"],
});
