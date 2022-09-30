import { KeyboardEvent, useEffect, useRef } from "react";
import {
  capitalizeFirstLetters,
  spaceOutCapitalLetters,
} from "@utils/string-utils";
import {
  PluginMetaData,
  MacroActionSequence,
  MacroDTO,
  TriggerType,
  Operator,
  ConditionComparator,
} from "common/types";
import { ActionablePanel } from "./actionable-panel/actionable-panel";
import { CreateMacroConditionOrAction } from "./create-macro-condition-or-action";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { KeyboardPreview } from "./keyboard-preview";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { useMacroStore } from "./use-macros-store";
import { MathUtils } from "three";
import { worldEventsList } from "@core/world/world-events";
import { WorldEventTrigger } from "@macros/world-event-trigger";

export const MacroPanel = ({
  macro,
  pluginsMetadata,
  activeAction: activeActionOrCondition,
  setActiveAction: setActiveActionOrCondition,
}: {
  macro: MacroDTO;
  pluginsMetadata: PluginMetaData[];
  activeAction: string | null;
  setActiveAction: (id: string) => void;
}) => {
  const { updateMacro, deleteMacro, createActionable } = useMacroStore();

  const updateTriggerValue = (value: any) => {
    updateMacro({
      ...macro,
      trigger: {
        ...macro.trigger,
        value,
      },
    });
  };

  const changeHotkeyTriggerKey = async (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = await hotkeyTrigger!.value.generateKeyComboFromEvent(e);
    if (key) {
      updateTriggerValue(hotkeyTrigger!.serialize());
    }
  };

  const changeMouseTriggerCode = async (e: MouseEvent) => {
    e.preventDefault();
    mouseTrigger!.copy(e);
    updateTriggerValue(mouseTrigger!.serialize());
  };

  const renameMacro = (name: string | null) => {
    if (name !== null && name.trim() !== "") {
      if (nameRef.current) {
        nameRef.current.innerText = name;
      }
      updateMacro({ ...macro, name });
    }
  };

  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.innerText = macro.name;
    }
  }, []);

  const hotkeyTrigger =
    macro.trigger.type === TriggerType.Hotkey
      ? HotkeyTrigger.deserialize(macro.trigger.value)
      : null;

  const mouseTrigger =
    macro.trigger.type === TriggerType.Mouse
      ? MouseTrigger.deserialize(macro.trigger.value)
      : null;

  const eventTrigger =
    macro.trigger.type === TriggerType.WorldEvent
      ? WorldEventTrigger.deserialize(macro.trigger.value)
      : null;

  return (
    <div
      style={{
        padding: "var(--size-4)",
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
          <i
            className="material-icons"
            style={{ fontSize: "var(--font-size-3)" }}
          >
            beenhere
          </i>
          &nbsp;
          <span
            ref={nameRef}
            contentEditable
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                e.preventDefault();
                e.target.blur();
              }
            }}
            onBlur={(e) => renameMacro(e.target.textContent)}
          ></span>
        </h4>

        <span>
          <label>
            {capitalizeFirstLetters(macro.trigger.type)}
            {hotkeyTrigger && (
              <div>
                <input
                  value={hotkeyTrigger.stringify()}
                  onKeyDown={changeHotkeyTriggerKey}
                  readOnly={true}
                />
                <label>
                  On KeyUp
                  <input
                    type="checkbox"
                    checked={hotkeyTrigger.onKeyUp}
                    onChange={(e) => {
                      hotkeyTrigger.onKeyUp = e.target.checked;
                      updateTriggerValue(hotkeyTrigger.serialize());
                    }}
                  />
                </label>
              </div>
            )}
            {mouseTrigger && (
              <input
                value={mouseTrigger.stringify()}
                onMouseDown={(e) => changeMouseTriggerCode(e.nativeEvent)}
                readOnly={true}
              />
            )}
            {eventTrigger && (
              <select
                onChange={(e) => {
                  eventTrigger.eventName = e.target.value;
                  updateTriggerValue(eventTrigger.serialize());
                }}
              >
                {worldEventsList.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
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
              Run Macro (Manually)
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
      {macro.trigger.type === TriggerType.Hotkey && (
        <KeyboardPreview
          previewKey={
            HotkeyTrigger.deserialize(macro.trigger.value).value.codes[0]
          }
          svgProps={{ width: "100px" }}
        />
      )}

      {macro.error && <p style={{ color: "var(--red-6)" }}>{macro.error}</p>}
      <div style={{ display: "flex" }}>
        <CreateMacroConditionOrAction
          label="Condition"
          onCreate={() => {
            createActionable(macro, {
              type: "condition",
              id: MathUtils.generateUUID(),
              path: [":app"],
              comparator: ConditionComparator.Equals,
            });
          }}
          pluginsMetadata={pluginsMetadata}
        />
        <CreateMacroConditionOrAction
          label="Action"
          onCreate={() => {
            createActionable(macro, {
              type: "action",
              id: MathUtils.generateUUID(),
              path: [":app"],
              operator: Operator.Set,
            });
          }}
          pluginsMetadata={pluginsMetadata}
        />
      </div>
      <div>
        <p>Conditions (Optional)</p>
        {macro.conditions.map((condition) => (
          <ActionablePanel
            key={condition.id}
            macro={macro}
            action={condition}
            pluginsMetadata={pluginsMetadata}
            viewOnly={activeActionOrCondition !== condition.id}
            setActiveAction={setActiveActionOrCondition}
          />
        ))}
        <p>Actions</p>
        {macro.actions.map((action) => (
          <ActionablePanel
            macro={macro}
            key={action.id}
            action={action}
            pluginsMetadata={pluginsMetadata}
            viewOnly={activeActionOrCondition !== action.id}
            setActiveAction={setActiveActionOrCondition}
          />
        ))}
      </div>
    </div>
  );
};
