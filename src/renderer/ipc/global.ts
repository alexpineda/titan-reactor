import { UI_SYSTEM_OPEN_URL } from "@plugins/events";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
    DEACTIVATE_PLUGIN,
    GO_TO_START_PAGE_LOCAL,
    LOG_MESSAGE_REMOTE,
    ON_PLUGINS_ACTIVATED_LOCAL,
    ON_PLUGINS_INITIAL_INSTALL_LOCAL,
    ON_PLUGINS_INITIAL_INSTALL_ERROR_LOCAL,
    OPEN_ISCRIPTAH_LOCAL,
    RELOAD_PLUGINS_LOCAL,
    SEND_BROWSER_WINDOW,
    EXEC_MACRO_LOCAL,
    QUEUE_FILES_LOCAL,
    CLEAR_REPLAY_DIALOG_LOCAL
} from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { withErrorMessage } from "common/utils/with-error-message";
import { PluginMetaData } from "common/types";

import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { globalEvents } from "../core/global-events";
import { setStorageIsCasc, setStoragePath } from "common/casclib";



window.addEventListener(
    "message",
    ( evt: { data: { type?: string; payload?: string } } ) =>
        evt.data.type === UI_SYSTEM_OPEN_URL &&
        globalEvents.emit( "unsafe-open-url", evt.data.payload )
);

// Load Home Scene
ipcRenderer.on( GO_TO_START_PAGE_LOCAL, () => globalEvents.emit( "load-home-scene" ) );

// Log Message
ipcRenderer.on( LOG_MESSAGE_REMOTE, ( _, message: string, level = "info" ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    globalEvents.emit( "log-message", { message, level } )
);

// Load Map File
ipcRenderer.on( QUEUE_FILES_LOCAL, ( _, payload ) =>
    globalEvents.emit( "queue-files", payload )
);

// Load Map File
ipcRenderer.on( CLEAR_REPLAY_DIALOG_LOCAL, ( ) =>
    globalEvents.emit( "clear-replay-queue" )
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
        globalEvents.emit("queue-files", {files: [...event.dataTransfer.files].map( file => file.path ), append: event.shiftKey});
    }

});


// Load ISCRIPTAH
ipcRenderer.on( OPEN_ISCRIPTAH_LOCAL, () => globalEvents.emit( "load-iscriptah" ) );

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

ipcRenderer.on( ON_PLUGINS_ACTIVATED_LOCAL, ( _, plugins: PluginMetaData[] ) =>
    globalEvents.emit( "command-center-plugins-activated", plugins )
);

ipcRenderer.on( DEACTIVATE_PLUGIN, ( _, pluginId: string ) =>
    globalEvents.emit( "command-center-plugin-deactivated", pluginId )
);

// Plugin Initial Install Error
ipcRenderer.on( ON_PLUGINS_INITIAL_INSTALL_ERROR_LOCAL, () =>
    globalEvents.emit( "initial-install-error-plugins" )
);



// Initial Plugin Install
ipcRenderer.on( ON_PLUGINS_INITIAL_INSTALL_LOCAL, () => {
    useSettingsStore.setState( { initialInstall: true } );
} );


// Execute a Macro
ipcRenderer.on( EXEC_MACRO_LOCAL, ( _: IpcRendererEvent, macroId: string ) =>
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
ipcRenderer.on( RELOAD_PLUGINS_LOCAL, () => globalEvents.emit( "reload-all-plugins" ) );

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

// (async () => {
//     const url = await ipcRenderer.invoke( "get-config-window-url" );
//     console.log(url)
//     window.open( url, "_blank" )
// })()