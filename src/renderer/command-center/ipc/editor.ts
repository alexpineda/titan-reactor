import { ipcRenderer } from "electron";

import {
    EDITOR_GET_TS_COMPLETIONS_AT_POS_REMOTE,
    EDITOR_SET_CONTENTS_REMOTE,
} from "common/ipc-handle-names";

type Completions = {
    type: string;
    label: string;
}[];

export const getTsCompletionsAtPosition = async ( pos: number ) => {
    return ( await ipcRenderer.invoke(
        EDITOR_GET_TS_COMPLETIONS_AT_POS_REMOTE,
        pos
    ) ) as Promise<Completions>;
};

export const setEditorContents = async ( contents: string ) => {
    return ( await ipcRenderer.invoke(
        EDITOR_SET_CONTENTS_REMOTE,
        contents
    ) ) as Promise<boolean>;
};
