import { dialog } from "electron";

import windows from "../../windows";

export const showOpenFolderDialog = (onOpen: (filePaths: string[]) => void) =>
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
      onOpen(filePaths);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Loading File",
        message: "There was an error selecting path: " + err.message,
      });
    });

interface OpenFileDialogOptions {
  title: string;
  extensions: string[];
  command: string;
  defaultPath?: string;
  multiSelect?: boolean;
}

export const showOpenFileDialog = function (options: OpenFileDialogOptions) {
  const { title, extensions, command, defaultPath, multiSelect } =
    Object.assign({}, options);

  const filters = [{ name: title, extensions }];
  const multiSelections = ["openFile"];
  if (multiSelect) {
    multiSelections.push("multiSelections");
  }

  dialog
    .showOpenDialog({
      properties: multiSelections as keyof typeof dialog.showOpenDialog,
      filters,
      defaultPath,
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
      windows.main?.webContents.send(command, filePaths);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Loading File",
        message: "There was an error loading this file: " + err.message,
      });
    });
};
