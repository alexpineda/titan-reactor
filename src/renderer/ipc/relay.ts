import { ipcRenderer } from "electron";

import { BrowserTargetPayloadType, InvokeBrowserTarget, INVOKE_BROWSER_WINDOW, INVOKE_BROWSER_WINDOW_RESPONSE } from "common/ipc-handle-names";

export const invokeWindow = async (target: InvokeBrowserTarget, message: { type: string, payload?: any }) => {
    const messageId = Math.random().toString();
    return await ipcRenderer.invoke(INVOKE_BROWSER_WINDOW, { target, messageId }, message);
}

const _registry = new Set<BrowserTargetPayloadType>();
export const onWindowInvoked = (type: BrowserTargetPayloadType, cb: (payload: any) => any) => {
    if (_registry.has(type)) {
        throw new Error(`onWindowInvoked: type ${type} already registered`);
    }
    _registry.add(type);

    const _messageListener = async (_: any, messageId: string, message: { type: string, payload: any }) => {
        if (message.type === type) {
            ipcRenderer.send(INVOKE_BROWSER_WINDOW_RESPONSE, messageId, await cb(message.payload));
        }
    };
    ipcRenderer.on(INVOKE_BROWSER_WINDOW, _messageListener);

    return () => {
        _registry.delete(type);
        ipcRenderer.off(INVOKE_BROWSER_WINDOW, _messageListener);
    }
}