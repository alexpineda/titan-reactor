import {
    InvokeBrowserTarget,
    INVOKE_BROWSER_WINDOW,
    INVOKE_BROWSER_WINDOW_RESPONSE,
    SEND_BROWSER_WINDOW,
} from "common/ipc-handle-names";
import { ipcMain } from "electron";
import browserWindows, { getEntryFileUrl } from "../windows";

ipcMain.on(
    SEND_BROWSER_WINDOW,
    (
        event,
        { target }: { target: InvokeBrowserTarget },
        message: { type: "manual-macro-trigger"; payload: any }
    ) => {
        const targetWindow =
            target === InvokeBrowserTarget.Game
                ? browserWindows.main!
                : browserWindows.config!;

        if ( event.sender === targetWindow.webContents ) {
            throw new Error(
                `onWindowInvoked: target ${target} is the same as the sender`
            );
        }

        targetWindow.webContents.send( SEND_BROWSER_WINDOW, message );
    }
);

ipcMain.handle(
    INVOKE_BROWSER_WINDOW,
    (
        event,
        { target, messageId }: { target: string; messageId: string },
        message: { type: string; payload: any }
    ) => {
        const targetWindow =
            target === InvokeBrowserTarget.Game
                ? browserWindows.main!.webContents
                : browserWindows.config!.webContents;

        if ( event.sender === targetWindow ) {
            throw new Error(
                `onWindowInvoked: target ${target} is the same as the sender`
            );
        }

        return new Promise( ( resolve, reject ) => {
            const _responseListener = (
                _: any,
                responseMessageId: string,
                response: any
            ) => {
                if ( messageId === responseMessageId ) {
                    ipcMain.off( INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener );
                    clearTimeout( _timeout );
                    resolve( response );
                }
            };

            const _timeout = setTimeout( () => {
                ipcMain.off( INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener );
                reject();
            }, 1000 );

            ipcMain.on( INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener );
            targetWindow.send( INVOKE_BROWSER_WINDOW, messageId, message );
        } );
    }
);

ipcMain.handle("get-config-window-url", () => {
    return  getEntryFileUrl( "command-center.html" );
})