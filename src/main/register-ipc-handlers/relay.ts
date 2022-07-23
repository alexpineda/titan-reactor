import { InvokeBrowserTarget, INVOKE_BROWSER_WINDOW, INVOKE_BROWSER_WINDOW_RESPONSE } from "common/ipc-handle-names";
import { ipcMain } from "electron";
import browserWindows from "../windows";

ipcMain.handle(INVOKE_BROWSER_WINDOW, (_, { target, messageId }: { target: string, messageId: string }, message: { type: string, payload: any }) => {

    const targetWindow = target === InvokeBrowserTarget.Game ? browserWindows.main!.webContents : browserWindows.config!.webContents;

    return new Promise((resolve, reject) => {
        const _responseListener = (_: any, responseMessageId: string, response: any) => {
            if (messageId === responseMessageId) {
                ipcMain.off(INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener);
                clearTimeout(_timeout);
                resolve(response);
            }
        }

        const _timeout = setTimeout(() => {
            ipcMain.off(INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener);
            reject();
        }, 1000);

        ipcMain.on(INVOKE_BROWSER_WINDOW_RESPONSE, _responseListener);
        targetWindow.send(INVOKE_BROWSER_WINDOW, messageId, message);
    });
});