import { KeyboardEvent, useState } from "react";
import {
  capitalizeFirstLetters,
  spaceOutCapitalLetters,
} from "@utils/string-utils";
import {
  PluginMetaData,
  MacroAction,
  MacroActionSequence,
  MacroDTO,
  TriggerType,
} from "common/types";
import { MacroActionPanel } from "./macro-action-panel";
import debounce from "lodash.debounce";
import { CreateMacroAction } from "./create-macro-action";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import EditableLabel from "react-inline-editing";

export const MacroPanel = ({
  macro,
  pluginsMetadata,
  updateMacro,
  updateMacroAction,
  activeAction,
  setActiveAction,
  deleteAction,
  deleteMacro,
  createAction,
  iconCache,
}: {
  macro: MacroDTO;
  pluginsMetadata: PluginMetaData[];
  updateMacro: (macro: MacroDTO) => void;
  updateMacroAction: (action: MacroAction) => void;
  activeAction: string | null;
  setActiveAction: (id: string | null) => void;
  deleteAction: (id: string) => void;
  deleteMacro: (id: string) => void;
  createAction: (macro: MacroDTO, action: MacroAction) => void;
  iconCache: Record<number, string>;
}) => {
  const ChangeHotkeyTriggerKey = debounce(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (
        e.code.includes("Shift") ||
        e.code.includes("Control") ||
        e.code.includes("Alt") ||
        e.code.includes("Escape") ||
        e.code.includes("ArrowUp") ||
        e.code.includes("ArrowDown") ||
        e.code.includes("ArrowLeft") ||
        e.code.includes("ArrowRight")
      ) {
        return;
      }
      const shiftKey = e.shiftKey ? ["Shift"] : [];
      const ctrlKey = e.ctrlKey ? ["Ctrl"] : [];
      const altKey = e.altKey ? ["Alt"] : [];
      const key =
        e.code === "Backspace"
          ? ""
          : [...shiftKey, ...ctrlKey, ...altKey, e.code].join("+");

      updateMacro({
        ...macro,
        trigger: {
          ...macro.trigger,
          value: key,
        },
      });
    },
    100,
    { leading: true, trailing: false }
  );

  const renameMacro = (name: string) => {
    if (name !== macro.name) {
      updateMacro({ ...macro, name });
    }
  };

  return (
    <div
      style={{
        padding: "var(--size-4)",
        margin: "var(--size-7)",
        borderRadius: "var(--size-4)",
        boxShadow: "2px 2px 10px -6px",
      }}
    >
      <span
        style={{
          display: "grid",
          gridGap: "var(--size-3)",
          padding: "var(--size-3)",
          gridTemplateColumns: "auto auto auto 1fr",
          alignItems: "center",
          justifyContent: "start",
          marginBottom: "var(--size-5)",
        }}
      >
        <h4
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: "var(--size-6)",
              filter: "invert(100%) sepia(1) saturate(100%) hue-rotate(50deg)",
            }}
            src={iconCache[389]}
          />
          <EditableLabel text={macro.name} onFocusOut={renameMacro} />
        </h4>

        <span>
          <label>
            {capitalizeFirstLetters(macro.trigger.type)}
            {macro.trigger.type === TriggerType.Hotkey && (
              <input
                value={macro.trigger.value}
                onKeyDown={ChangeHotkeyTriggerKey}
                readOnly={true}
              />
            )}
          </label>
        </span>
        <span>
          <label>
            Sequence{" "}
            <select
              onChange={(evt) => {
                updateMacro({
                  ...macro,
                  actionSequence:
                    MacroActionSequence[
                      evt.target.value as keyof typeof MacroActionSequence
                    ],
                });
              }}
              value={macro.actionSequence}
            >
              {Object.keys(MacroActionSequence).map((key) => (
                <option key={key} value={key}>
                  {spaceOutCapitalLetters(key)}
                </option>
              ))}
            </select>
          </label>
        </span>
        <div
          style={{
            display: "grid",
            justifyContent: "end",
            gridTemplateColumns: "auto auto",
            gridGap: "var(--size-4)",
          }}
        >
          {(macro.trigger.type === TriggerType.Manual ||
            macro.trigger.type === TriggerType.Hotkey) && (
            <button
              onClick={() => {
                sendWindow(InvokeBrowserTarget.Game, {
                  type: SendWindowActionType.ManualMacroTrigger,
                  payload: macro.id,
                });
              }}
            >
              <i className="material-icons" style={{ color: "var(--green-7)" }}>
                play_arrow
              </i>{" "}
              Test Macro
            </button>
          )}
          <button
            style={{
              color: "var(--red-6)",
              padding: "var(--size-2)",
            }}
            onClick={() => deleteMacro(macro.id)}
          >
            <i
              className="material-icons"
              style={{
                fontSize: "var(--font-size-4)",
              }}
            >
              delete
            </i>
          </button>
        </div>
      </span>
      <CreateMacroAction
        onCreate={(action) => createAction(macro, action)}
        pluginsMetadata={pluginsMetadata}
      />
      <div>
        {macro.actions.map((action) => (
          <MacroActionPanel
            iconCache={iconCache}
            key={action.id}
            action={action}
            pluginsMetadata={pluginsMetadata}
            updateMacroAction={updateMacroAction}
            viewOnly={activeAction !== action.id}
            setActiveAction={setActiveAction}
            deleteAction={deleteAction}
          />
        ))}
      </div>
    </div>
  );
};