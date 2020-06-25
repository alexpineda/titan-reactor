const { ipcMain, app } = require("electron");
const fs = require("fs");
const path = require("path");

const getAppCachePath = "getAppCachePath";

ipcMain.handle(getAppCachePath, async (event, folder = "") => {
  debugger;
  return path.join(app.getPath("appData"), folder);
});

module.exports = {
  handles: {
    getAppCachePath,
  },
};
