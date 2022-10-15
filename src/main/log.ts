export const bootupLogs: LogMessage[] = [];
import { LogLevel } from "common/logging";
import { logService } from "./logger/singleton";

interface LogMessage {
    level: LogLevel;
    message: string;
}

let _writeBootupLogs = true;
export const getBootupLogs = () => {
    _writeBootupLogs = false;
    return bootupLogs;
};

export default {
    info: ( message: string ) => {
        logService.info( message );
        _writeBootupLogs && bootupLogs.push( { level: "info", message } );
    },
    warn: ( message: string ) => {
        logService.warn( message );
        _writeBootupLogs && bootupLogs.push( { level: "warn", message } );
    },
    error: ( message: string ) => {
        logService.error( message );
        _writeBootupLogs && bootupLogs.push( { level: "error", message } );
    },
};
