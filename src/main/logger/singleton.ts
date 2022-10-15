import path from "path";

import getUserDataPath from "../get-user-data-path";
import { createLogger } from "./create-logger";

export const logFilePath = path.join( getUserDataPath(), "logs", "app" );

export const logService = createLogger( logFilePath, {
    logLevels: ["info", "debug", "warning", "error"],
} );
