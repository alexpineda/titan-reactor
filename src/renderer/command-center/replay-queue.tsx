import { openReplayDialog } from "@ipc/dialogs";
import { useState } from "react";
import path from "path";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";

type ReplayFileInfo = {
  filepath: string;
  filename: string;
  opened: boolean;
};

const _queue: ReplayFileInfo[] = [];

export const ReplayQueue = () => {
  const [queue, setQueue] = useState<ReplayFileInfo[]>(_queue);

  return (
    <div style={{ padding: "var(--size-3)" }}>
      <div
        style={{
          display: "flex",
          justifyItems: "space-between",
          alignItems: "center",
        }}
      >
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
          }}
        >
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
              }}
            >
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
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <i className="material-icons">folder_open</i>
                  <span>open</span>
                </div>
              </td>
              <td
                onClick={() => {
                  _queue.splice(_queue.indexOf(item), 1);
                  setQueue([..._queue]);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
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
