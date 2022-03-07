import { Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";
import browserWindows from "./windows";
import settings from "./settings/singleton"
import { RELOAD_PLUGINS } from "common/ipc-handle-names";

const settingsPath = path.join(getUserDataPath(), "settings.json");
export const logFilePath = path.join(getUserDataPath(), "logs", "app");

export default (onOpenPluginManager: () => void) => {

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
        {
          label: "&Preferences (settings.json)",
          click: function () {
            shell.showItemInFolder(settingsPath)
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
          label: "&Settings \& Plugin Manager",
          click: function () {
            onOpenPluginManager();
          },
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "&Debug",
      submenu: [
        {
          label: "Reload Settings",
          click: async () => {
            await settings.initialize();
            browserWindows.main?.webContents.reload();
          }
        },
        {
          label: "Reload All Plugins",
          click: function () {
            browserWindows.main?.webContents.send(RELOAD_PLUGINS);
          }
        },
        { type: "separator" },
        { role: "toggledevtools" },
        { type: "separator" },
        {
          label: "View &Log File(s)",
          click: function () {
            shell.showItemInFolder(logFilePath);
          },
        },
        { type: "separator" },
        {
          label: "Change Screen", submenu: [
            {
              label: "@home/loading",
              click: function () {
              },
            },
            {
              label: "@home/ready",
              click: function () {
              },
            },
            {
              label: "@replay/loading",
              click: function () {
              },
            },
            {
              label: "@replay/ready",
              click: function () {
              },
            },
            ,
            {
              label: "@map/loading",
              click: function () {
              },
            },
            {
              label: "@map/ready",
              click: function () {
              }
            }]
        }
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
        }
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}