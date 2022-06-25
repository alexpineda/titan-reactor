import { Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";
import browserWindows from "./windows";
import settings from "./settings/singleton"
import { RELOAD_PLUGINS } from "common/ipc-handle-names";
import { spawn } from "child_process";

const settingsPath = path.join(getUserDataPath(), "settings.json");
export const logFilePath = path.join(getUserDataPath(), "logs");

export default (onOpenPluginManager: () => void, onOpenIscriptah: () => void) => {

  const template = [
    {
      label: "&File",
      submenu: [
        { type: "separator" },
        {
          label: "Open &Map",
          click: function () {
            showOpenMapDialog();
          },
        },
        {
          label: "Open &Replay",
          click: function () {
            showOpenReplayDialog();
          },
        },
        { type: "separator" },
        { role: "quit" }
      ],
    },
    {
      label: "&View",
      submenu: [
        {
          label: "&Manage Plugins",
          click: function () {
            onOpenPluginManager();
          },
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "&Tools",
      submenu: [
        {
          label: "Reload App",
          click: async () => {
            await settings.initialize();
            browserWindows.main?.webContents.reload();
          }
        },
        {
          label: "Reload All Plugins",
          click: async () => {
            await settings.initialize();
            browserWindows.main?.webContents.send(RELOAD_PLUGINS);
          }
        },
        { type: "separator" },
        { role: "toggledevtools" },
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
        {
          label: "&IScriptah - Animation Viewer",
          click: function () {
            onOpenIscriptah();
          },
        },
      ],
    },
    {
      label: "&About",
      submenu: [

        {
          label: "Github",
          click: async () => {
            await shell.openExternal("https://github.com/imbateam-gg/titan-reactor");
          },
        },
        {
          label: "Discord",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        },
        {
          label: "Twitter",
          click: async () => {
            await shell.openExternal("https://twitter.com/imbateam");
          },
        },
        {
          label: "Patreon",
          click: async () => {
            await shell.openExternal("https://www.patreon.com/imbateam");
          },
        }
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}