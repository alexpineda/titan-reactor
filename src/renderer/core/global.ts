import { UI_SYSTEM_OPEN_URL } from "@plugins/events";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
    DEACTIVATE_PLUGIN,
    GO_TO_START_PAGE,
    LOG_MESSAGE,
    ON_PLUGINS_ACTIVATED,
    ON_PLUGINS_INITIAL_INSTALL,
    ON_PLUGINS_INITIAL_INSTALL_ERROR,
    OPEN_ISCRIPTAH,
    OPEN_MAP_DIALOG,
    OPEN_REPLAY_DIALOG,
    RELOAD_PLUGINS,
    SEND_BROWSER_WINDOW,
    SERVER_API_FIRE_MACRO,
} from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { withErrorMessage } from "common/utils/with-error-message";
import { PluginMetaData } from "common/types";
import { MainMixer } from "@audio/main-mixer";
import { Music } from "@audio/music";
import { AudioListener } from "three";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { globalEvents } from "./global-events";
import { setStorageIsCasc, setStoragePath } from "common/casclib";

/**
 * INTERCEPTS IPC MESSAGES AND PUSHES THEM INTO THE GLOBAL EVENT BUS. WE DO THIS TO KEEP THINGS CLEAN.
 * ALSO CREATES GLOBAL SOUND MIXER AND MUSIC PLAYER
 */

export const mixer = new MainMixer();
export const music = new Music( mixer as unknown as AudioListener );

window.addEventListener(
    "message",
    ( evt: { data: { type?: string; payload?: string } } ) =>
        evt.data.type === UI_SYSTEM_OPEN_URL &&
        globalEvents.emit( "unsafe-open-url", evt.data.payload )
);

// Load Home Scene
ipcRenderer.on( GO_TO_START_PAGE, () => globalEvents.emit( "load-home-scene" ) );

// Log Message
ipcRenderer.on( LOG_MESSAGE, ( _, message: string, level = "info" ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    globalEvents.emit( "log-message", { message, level } )
);

// Load Map File
ipcRenderer.on( OPEN_MAP_DIALOG, ( _, map: string ) =>
    globalEvents.emit( "load-map-file", map )
);

// Load Replay File
ipcRenderer.on( OPEN_REPLAY_DIALOG, ( _, replay: string ) => {
    console.log( "OPEN_REPLAY_DIALOG", replay );
    globalEvents.emit( "load-replay-file", replay );
}
);


// Load Replay File ( Replay Queue)
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.LoadReplay>;
        }
    ) => {
        if ( type === SendWindowActionType.LoadReplay ) {
            globalEvents.emit( "load-replay-file", payload );
        }
    }
);

// Load Replay File ( Replay Queue)
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _,
        {
            type,
        }: {
            type: SendWindowActionType;
        }
    ) => {
        if ( type === SendWindowActionType.EndOfReplays ) {
            globalEvents.emit( "end-of-replay-queue" );
        }
    }
);


// Load Replay File ( Drag and Drop )

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (event) => {
    
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length) {
        const filePath = event.dataTransfer.files[0].path;
        if (filePath.endsWith('.rep')) {
            globalEvents.emit( "load-replay-file", event.dataTransfer.files[0].path );
        } else if ( filePath.endsWith('.scx') || filePath.endsWith('.scm') ) {
            globalEvents.emit( "load-map-file", event.dataTransfer.files[0].path );
        }
    }

});


// Load ISCRIPTAH
ipcRenderer.on( OPEN_ISCRIPTAH, () => globalEvents.emit( "load-iscriptah" ) );

// Command Center Updated Settings
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.CommitSettings>;
        }
    ) => {
        if ( type === SendWindowActionType.CommitSettings ) {
            globalEvents.emit( "command-center-save-settings", payload );
        }
    }
);


// Command Center Changed a Plugin Configuration
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _,
        {
            type,
            payload: { pluginId, config },
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>;
        }
    ) => {
        if ( type === SendWindowActionType.PluginConfigChanged ) {
            globalEvents.emit( "command-center-plugin-config-changed", {
                pluginId,
                config,
            } );
        }
    }
);

ipcRenderer.on( ON_PLUGINS_ACTIVATED, ( _, plugins: PluginMetaData[] ) =>
    globalEvents.emit( "command-center-plugins-activated", plugins )
);

ipcRenderer.on( DEACTIVATE_PLUGIN, ( _, pluginId: string ) =>
    globalEvents.emit( "command-center-plugin-deactivated", pluginId )
);

// Plugin Initial Install Error
ipcRenderer.on( ON_PLUGINS_INITIAL_INSTALL_ERROR, () =>
    globalEvents.emit( "initial-install-error-plugins" )
);



// Initial Plugin Install
ipcRenderer.on( ON_PLUGINS_INITIAL_INSTALL, () => {
    useSettingsStore.setState( { initialInstall: true } );
} );


// Execute a Macro
ipcRenderer.on( SERVER_API_FIRE_MACRO, ( _: IpcRendererEvent, macroId: string ) =>
    globalEvents.emit( "exec-macro", macroId )
);

// Execute a Macro ( Manual Trigger )
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _: IpcRendererEvent,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>;
        }
    ) => {
        if ( type === SendWindowActionType.ManualMacroTrigger ) {
            globalEvents.emit( "exec-macro", payload );
        }
    }
);

// Reset Macro Actions
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _: IpcRendererEvent,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.ResetMacroActions>;
        }
    ) => {
        if ( type === SendWindowActionType.ResetMacroActions ) {
            globalEvents.emit( "reset-macro-actions", payload );
        }
    }
);

// Execute a Macro Action
ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    (
        _: IpcRendererEvent,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType;
            payload: SendWindowActionPayload<SendWindowActionType.ManualMacroActionTrigger>;
        }
    ) => {
        if ( type === SendWindowActionType.ManualMacroActionTrigger ) {
            globalEvents.emit( "exec-macro-action", payload );
        }
    }
);

// Reload All Plugins
ipcRenderer.on( RELOAD_PLUGINS, () => globalEvents.emit( "reload-all-plugins" ) );


window.onerror = (
    _: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
) => {
    globalEvents.emit( "log-message", {
        message: withErrorMessage( error, `${lineno!}:${colno!} - ${source!}` ),
        level: "error",
    } );
};

document.addEventListener(
    "visibilitychange",
    () => globalEvents.emit( "document-hidden", document.hidden ),
    false
);

export const getJanitorLogLevel = () => {
    switch ( settingsStore().data.utilities.logLevel ) {
        case "debug":
            return JanitorLogLevel.Debug;
        case "warn":
        case "error":
            return JanitorLogLevel.Info;
    }

    return JanitorLogLevel.None;
};

useSettingsStore.subscribe( ( settings ) => {
    Janitor.logLevel = getJanitorLogLevel();

    setStorageIsCasc( settings.isCascStorage );
    setStoragePath( settings.data.directories.starcraft );
} );


