import { UI_SYSTEM_OPEN_URL } from "@plugins/events";
import { withErrorMessage } from "common/utils/with-error-message";

import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { globalEventKeys, GlobalEvents, globalEvents } from "../core/global-events";
// import { setStorageIsCasc, setStoragePath } from "common/casclib";

window.addEventListener(
    "message",
    ( evt: { data: { type?: string; payload?: string } } ) =>
        evt.data.type === UI_SYSTEM_OPEN_URL &&
        globalEvents.emit( "unsafe-open-url", evt.data.payload )
);

// Load Replay File ( Drag and Drop )

document.addEventListener( "dragover", ( e ) => {
    e.preventDefault();
    e.stopPropagation();
} );

document.addEventListener( "drop", ( event ) => {
    event.preventDefault();
    event.stopPropagation();

    if ( event.dataTransfer && event.dataTransfer.files.length ) {
        globalEvents.emit( "queue-files", {
            files: [ ...event.dataTransfer.files ],
            append: event.shiftKey,
        } );
    }
} );

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

type ConfigMessage = {
    type: keyof GlobalEvents;
    payload: any;
};

// receive global events from configuration ui
window.addEventListener( "message", function ( event: MessageEvent<ConfigMessage> ) {
    if ( globalEventKeys.includes( event.data.type ) ) {
        // eslint-disable-next-line
        globalEvents.emit(event.data.type, event.data.payload);
    }
} );

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

window.addEventListener( "keydown", ( event ) => {
    event.code === "KeyR" && event.ctrlKey && globalEvents.emit( "reload-all-plugins" );
} );

useSettingsStore.subscribe( () => {
    Janitor.logLevel = getJanitorLogLevel();
} );

// ipcRenderer.on( OPEN_ISCRIPTAH, () => globalEvents.emit( "load-iscriptah" ) );
