import { Menu, shell } from "electron";
import {
    showOpenMapDialog,
    showOpenReplayDialog,
} from "./register-ipc-handlers/dialogs";
import getUserDataPath from "./get-user-data-path";
import path from "path";
import browserWindows from "./windows";
import settings from "./settings/singleton";
import {
    OPEN_MAP_DIALOG,
    OPEN_REPLAY_DIALOG,
    RELOAD_PLUGINS,
} from "common/ipc-handle-names";
// import electronIsDev from "electron-is-dev";

const settingsPath = path.join( getUserDataPath() );
export const logFilePath = path.join( getUserDataPath(), "logs" );

export default (
    onOpenPluginManager: () => void,
    goToStartPage: () => void,
    openIscriptah: () => void
) => {
    const template = [
        {
            label: "&File",
            submenu: [
                { type: "separator" },
                {
                    label: "Open &Replay",
                    click: async function () {
                        const files = await showOpenReplayDialog();
                        if ( files && files.length > 0 ) {
                            browserWindows.main!.webContents.send(
                                OPEN_REPLAY_DIALOG,
                                files[0]
                            );
                        }
                    },
                },
                {
                    label: "Open &Map (Sandbox)",
                    click: async function () {
                        const files = await showOpenMapDialog();
                        if ( files && files.length > 0 ) {
                            browserWindows.main!.webContents.send(
                                OPEN_MAP_DIALOG,
                                files[0]
                            );
                        }
                    },
                },

                { type: "separator" },
                {
                    label: "View &Plugin File(s)",
                    click: function () {
                        void shell.openPath( settings.get().directories.plugins );
                    },
                },
                {
                    label: "View &Log File(s)",
                    click: function () {
                        void shell.openPath( logFilePath );
                    },
                },
                {
                    label: "View Raw Settings (settings.json)",
                    click: function () {
                        void shell.openPath( settingsPath );
                    },
                },
                { type: "separator" },
                { role: "quit" },
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
            ],
        },
        {
            label: "&Tools",
            submenu: [
                {
                    label: "Restart Application",
                    click: async () => {
                        await settings.initialize();
                        browserWindows.main?.webContents.reload();
                    },
                },
                {
                    label: "Reload Plugins",
                    click: async () => {
                        await settings.initialize();
                        browserWindows.main?.webContents.send( RELOAD_PLUGINS );
                    },
                },
                { type: "separator" },
                { role: "toggledevtools" },

                // ...( electronIsDev
                //     ? [ { type: "separator" }, { role: "toggledevtools" } ]
                //     : [] ),
                { type: "separator" },
                {
                    label: "&IScriptah - Animation Viewer",
                    click: function () {
                        openIscriptah();
                    },
                },
            ],
        },
    ];

    // @ts-expect-error
    const menu = Menu.buildFromTemplate( template );
    Menu.setApplicationMenu( menu );
};
