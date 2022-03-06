import { Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";

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
        { role: "reload" },
        { role: "toggledevtools" },
        {
          label: "View &Log File(s)",
          click: function () {
            shell.showItemInFolder(logFilePath);
          },
        },
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