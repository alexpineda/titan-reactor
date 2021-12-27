import { app, Menu, shell } from "electron";
import { showOpenMapDialog, showOpenReplayDialog } from "./register-ipc-handlers/dialogs";
const isMac = process.platform === "darwin";

export default (settingsPath: string) => {
  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
      : []),
    // { role: 'fileMenu' }
    {
      label: "&File",
      submenu: [
        {
          label: "Open &Preferences (settings.yml)",
          click: function () {
            shell.showItemInFolder(settingsPath)
          },
        },
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
        { role: isMac ? "close" : "quit" }
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Visit ImbaTeam.GG",
          click: async () => {
            await shell.openExternal("http://imbateam.gg");
          },
        },
        {
          label: "Join Our Discord",
          click: async () => {
            await shell.openExternal("http://discord.imbateam.gg");
          },
        },
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}