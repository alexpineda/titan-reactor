import { openReplayDialog } from "@ipc/dialogs";
import { useEffect, useState } from "react";
import path from "path";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget, SEND_BROWSER_WINDOW } from "common/ipc-handle-names";
import { ipcRenderer } from "electron";

interface ReplayFileInfo {
    filepath: string;
    filename: string;
    opened: boolean;
}

// cheap fast persistent for when window closes
const _queue: ReplayFileInfo[] = [];
const _lastOpened: ReplayFileInfo | null = null;

ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    () => (
        _: any,
        {
            type,
        }: {
            type: SendWindowActionType;
        }
    ) => {
        console.log("Received1", type)
    }
);

export const ReplayQueue = () => {
    const [queue, setQueue] = useState<ReplayFileInfo[]>(_queue);
    const [lastOpened, setLastOpened] = useState<ReplayFileInfo | null>(_lastOpened);

    const playReplay = (replay: ReplayFileInfo) => {
        sendWindow<SendWindowActionType.LoadReplay>(
            InvokeBrowserTarget.Game,
            {
                type: SendWindowActionType.LoadReplay,
                payload: replay.filepath,
            }
        );
        replay.opened = true;
        setQueue([...queue]);
        setLastOpened(replay);
    }


    useEffect(() => {
        const cb = () => (
            _: any,
            {
                type,
            }: {
                type: SendWindowActionType;
            }
        ) => {
            console.log("Received2", type)
            if (type === SendWindowActionType.NextReplay) {
                const nextUp = _queue.find((item) => !item.opened);
                if (nextUp) {
                    playReplay(nextUp)
                } else {
                    sendWindow<SendWindowActionType.EndOfReplays>(
                        InvokeBrowserTarget.Game,
                        {
                            type: SendWindowActionType.EndOfReplays,
                        }
                    );
                }
            }
        }
        // Replay finished on game side, requested next one
        ipcRenderer.on(
            SEND_BROWSER_WINDOW,
            cb
        );

        return () => {
            ipcRenderer.removeListener(SEND_BROWSER_WINDOW, cb);
        }
    }, []);



    return (
        <div style={{ padding: "var(--size-3)" }}>
            <div
                style={{
                    display: "flex",
                    justifyItems: "space-between",
                    alignItems: "center",
                }}>
                <button
                    onClick={async () => {
                        const files = await openReplayDialog(true);
                        if (files && files.length) {
                            _queue.push(
                                ...files.map((filepath: string) => ({
                                    filepath,
                                    filename: path.basename(filepath),
                                    opened: false,
                                }))
                            );
                            setQueue([..._queue]);
                        }
                    }}>
                    Add Replay
                </button>
            </div>
            <table>
                <tbody>
                    {queue.map((item) => (
                        <tr
                            key={item.filepath}
                            style={{
                                textDecoration: item.opened ? "line-through" : "none",
                                margin: "var(--size-4)",
                                backgroundColor: lastOpened?.filepath === item.filepath ? "yellow" : "transparent"
                            }}>
                            <td>{item.filename}</td>{" "}
                            <td
                                onClick={() => {
                                    sendWindow<SendWindowActionType.LoadReplay>(
                                        InvokeBrowserTarget.Game,
                                        {
                                            type: SendWindowActionType.LoadReplay,
                                            payload: item.filepath,
                                        }
                                    );
                                    item.opened = true;
                                    setQueue([...queue]);
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}>
                                    <i className="material-icons">folder_open</i>
                                    <span>open</span>
                                </div>
                            </td>
                            <td
                                onClick={() => {
                                    _queue.splice(_queue.indexOf(item), 1);
                                    setQueue([..._queue]);
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}>
                                    <i className="material-icons">delete</i>
                                    <span>remove</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
