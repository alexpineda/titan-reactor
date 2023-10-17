import { LogLevel } from "common/logging";
import { ipcMain } from "electron";

import { LOG_MESSAGE_REMOTE } from "../../common/ipc-handle-names";
import { logService } from "../logger/singleton";

ipcMain.on(
    LOG_MESSAGE_REMOTE,
    ( _, { level, message }: { level: LogLevel; message: string } ) => {
        logService.log( level, message );
    }
);
