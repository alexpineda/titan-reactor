import { ipcRenderer } from "electron";

import { EXIT } from "../../common/ipc-handle-names";

export const exit = () => {
  ipcRenderer.send(EXIT);
};
