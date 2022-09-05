import { Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";
import browserWindows from "./windows";
import settings from "./settings/singleton"
import { CLEAR_ASSET_CACHE, OPEN_ISCRIPTAH, OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG, RELOAD_PLUGINS } from "common/ipc-handle-names";
import { spawn } from "child_process";
import electronIsDev from "electron-is-dev";

const settingsPath = path.join(getUserDataPath(), "settings.json");
export const logFilePath = path.join(getUserDataPath(), "logs");

export default (onOpenPluginManager: () => void, goToStartPage: () => void) => {

  const template = [
    {
      label: "&File",
      submenu: [
        { type: "separator" },
        {
          label: "Open &Map",
          click: async function () {
            const files = await showOpenMapDialog();
            if (files && files.length > 0) {
              browserWindows.main!.webContents.send(OPEN_MAP_DIALOG, files[0]);
            }
          },
        },
        {
          label: "Open &Replay",
          click: async function () {
            const files = await showOpenReplayDialog();
            if (files && files.length > 0) {
              browserWindows.main!.webContents.send(OPEN_REPLAY_DIALOG, files[0]);
            }
          },
        },
        { type: "separator" },
        {
          label: "View &Plugin File(s)",
          click: function () {
            shell.openPath(settings.get().directories.plugins);
          },
        },
        {
          label: "View &Log File(s)",
          click: function () {
            shell.openPath(logFilePath);
          },
        },
        {
          label: "View Raw Settings (settings.json)",
          click: function () {
            spawn('C:\\windows\\notepad.exe', [settingsPath]);
          },
        },
        { type: "separator" },
        { role: "quit" }
      ],
    },
    {
      label: "&Go",
      submenu: [
        {
          label: "&Start Page",
          accelerator: "F12",
          click: function () {
            goToStartPage();
          },
        },
        {
          label: "&Command Center",
          accelerator: "F10",
          click: function () {
            onOpenPluginManager();
          },
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ]
    },
    {
      label: "&Tools",
      submenu: [
        {
          label: "Restart Application",
          click: async () => {
            await settings.initialize();
            browserWindows.main?.webContents.reload();
          }
        },
        {
          label: "Reload Plugins",
          click: async () => {
            await settings.initialize();
            browserWindows.main?.webContents.send(RELOAD_PLUGINS);
          }
        },
        ...(electronIsDev ? [
          { type: "separator" },
          { role: "toggledevtools" },
          {
            label: "&IScriptah - Animation Viewer",
            click: function () {
              browserWindows.main!.webContents.send(OPEN_ISCRIPTAH);
            },
          }] : []),
        { type: "separator" },
        {
          label: "Clear Asset Cache",
          click: async () => {
            browserWindows.main?.webContents.send(CLEAR_ASSET_CACHE);
          }
        }
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}