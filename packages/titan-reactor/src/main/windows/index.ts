import { BrowserWindow } from "electron";
import createGameWindow from "./create-game-window";

const browserWindows = {} as {
  main: null | BrowserWindow;
};

export const createMain = () => {
  if (browserWindows.main) {
    throw new Error("Main window already exists");
  }
  browserWindows.main = createGameWindow({
    onClose: () => {
      browserWindows.main = null;
    },
  });
};

export default browserWindows;
