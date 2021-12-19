import path from "path";

import getUserDataPath from "../get-user-data-path";
import createLogger from "./create-logger";

export const logFilePath = path.join(getUserDataPath(), "logs", "app");

export default createLogger(logFilePath, {
  logLevels: ["verbose", "info", "debug", "warning", "error"],
});
