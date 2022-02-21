import { BrowserWindow } from "electron";
import createGameWindow, { createWindow } from "./create-game-window";

const browserWindows = {} as {
  main: null | BrowserWindow;
  config: null | BrowserWindow;
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

export const createConfig = () => {
  if (browserWindows.config) {
    throw new Error("Config window already exists");
  }
  browserWindows.config = createWindow({
    onClose: () => {
      browserWindows.config = null;
    },
  });
}

export default browserWindows;
