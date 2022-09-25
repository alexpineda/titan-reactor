
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { createMacroStore } from "./macros-store";

export const useMacroStore = createMacroStore((payload) => {
    sendWindow(InvokeBrowserTarget.Game, {
        type: SendWindowActionType.CommitSettings,
        payload,
    });
});