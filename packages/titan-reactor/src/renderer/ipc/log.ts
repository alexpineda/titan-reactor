import { ipcRenderer } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";

export const log = async (message: string, level = "info") => {
  //@todo add isDev mode check
  if (level === "error") {
    console.error(message);
  } else if (level === "warn") {
    console.warn(message);
  } else {
    console.log(message);
  }

  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};
