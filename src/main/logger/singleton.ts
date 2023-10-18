import path from "path";

import { createLogger } from "./create-logger";

export const logFilePath = path.join( "logs", "app" );

export const logService = createLogger( logFilePath, {
    logLevels: ["info", "debug", "warning", "error"],
} );
