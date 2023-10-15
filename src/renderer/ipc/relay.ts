import { ipcRenderer } from "electron";

import {
    BrowserTargetPayloadType,
    InvokeBrowserTarget,
    INVOKE_BROWSER_WINDOW,
    INVOKE_BROWSER_WINDOW_RESPONSE,
    SEND_BROWSER_WINDOW,
} from "common/ipc-handle-names";
import { MacroAction, PluginConfig, SettingsMeta } from "common/types";

export const invokeWindow = async (
    target: InvokeBrowserTarget,
    message: { type: string; payload?: any }
) => {
    const messageId = Math.random().toString();
    return ( await ipcRenderer.invoke(
        INVOKE_BROWSER_WINDOW,
        { target, messageId },
        message
    ) ) as unknown;
};

export enum SendWindowActionType {
    ManualMacroTrigger = "ManualMacroTrigger",
    ManualMacroActionTrigger = "ManualMacroActionTrigger",
    ResetMacroActions = "ResetMacroActions",
    CommitSettings = "RefreshSettings",
    PluginConfigChanged = "PluginConfigChanged",
    // game -> command center
    ConsoleLog = "ConsoleLog",

}

export type SendWindowActionPayload<T> =
    T extends SendWindowActionType.ManualMacroTrigger
        ? string
        : T extends SendWindowActionType.ResetMacroActions
        ? string
        : T extends SendWindowActionType.ManualMacroActionTrigger
        ? { action: MacroAction; withReset: boolean }
        : T extends SendWindowActionType.CommitSettings
        ? SettingsMeta
        : T extends SendWindowActionType.PluginConfigChanged
        ? { pluginId: string; config: PluginConfig }
        : T extends SendWindowActionType.ConsoleLog
        ? { message: string; level: "info" | "warning" | "error" | "debug" }
        : never;

export function sendWindow<T extends SendWindowActionType>(
    target: InvokeBrowserTarget,
    message: { type: SendWindowActionType; payload?: SendWindowActionPayload<T> }
) {
    ipcRenderer.send( SEND_BROWSER_WINDOW, { target }, message );
}

const _registry = new Set<BrowserTargetPayloadType>();
export const onWindowInvoked = (
    type: BrowserTargetPayloadType,
    cb: ( payload: any ) => any
) => {
    if ( _registry.has( type ) ) {
        throw new Error( `onWindowInvoked: type ${type} already registered` );
    }
    _registry.add( type );

    const _messageListener = async (
        _: any,
        messageId: string,
        message: { type: string; payload: any }
    ) => {
        if ( message.type === type ) {
            ipcRenderer.send(
                INVOKE_BROWSER_WINDOW_RESPONSE,
                messageId,
                await cb( message.payload )
            );
        }
    };
    ipcRenderer.on( INVOKE_BROWSER_WINDOW, _messageListener );

    return () => {
        _registry.delete( type );
        ipcRenderer.off( INVOKE_BROWSER_WINDOW, _messageListener );
    };
};
