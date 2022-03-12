export const bootupLogs: LogMessage[] = [];
import logService from "./logger/singleton";

type LogMessage = {
    level: "info" | "warning" | "error" | "debug" | "verbose";
    message: string;
}

let _writeBootupLogs = true;
export const getBootupLogs = () => {
    _writeBootupLogs = false;
    return bootupLogs;
}

export default {
    info: (message: string) => {
        logService.info(message);
        _writeBootupLogs && bootupLogs.push({ level: "info", message });
    },
    warning: (message: string) => {
        logService.warning(message);
        _writeBootupLogs && bootupLogs.push({ level: "warning", message });
    },
    error: (message: string) => {
        logService.error(message);
        _writeBootupLogs && bootupLogs.push({ level: "error", message });
    }
}