import { KeyboardEvent, useEffect, useRef } from "react";
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
  MacroCondition,
  MutateActionEffect,
  MacroActionPluginModifyValue,
  MacroActionHostModifyValue,
} from "common/types";
import { MacroActionPanel } from "./macro-action-panel/macro-action-panel";
import { CreateMacroAction } from "./create-macro-action";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { MacroCustomHookOptions } from "./macro-custom-hook-options";
import { KeyboardPreview } from "./keyboard-preview";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MacroConditionPanel } from "./macro-condition-panel/macro-condition-panel";
import { CreateMacroCondition } from "./create-macro-condition";
import { MouseTrigger } from "@macros/mouse-trigger";

export const MacroPanel = ({
  macro,
  pluginsMetadata,
  updateMacro,
  updateMacroAction,
  updateMacroActionEffect,
  updateMacroCondition,
  activeAction: activeActionOrCondition,
  setActiveAction: setActiveActionOrCondition,
  deleteAction,
  deleteCondition,
  deleteMacro,
  createAction,
  createCondition,
}: {
  macro: MacroDTO;
  pluginsMetadata: PluginMetaData[];
  updateMacro: (macro: MacroDTO) => void;
  updateMacroAction: (action: MacroAction) => void;
  updateMacroActionEffect: (
    action: MacroActionHostModifyValue | MacroActionPluginModifyValue,
    effect: MutateActionEffect
  ) => void;
  updateMacroCondition: (condition: MacroCondition) => void;
  activeAction: string | null;
  setActiveAction: (id: string | null) => void;
  deleteAction: (id: string) => void;
  deleteCondition: (id: string) => void;
  deleteMacro: (id: string) => void;
  createAction: (macro: MacroDTO, action: MacroAction) => void;
  createCondition: (macro: MacroDTO, action: MacroCondition) => void;
}) => {
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
            {macro.trigger.type === TriggerType.GameHook && (
              <MacroCustomHookOptions
                macro={macro}
                pluginsMetadata={pluginsMetadata}
                updateTriggerValue={updateTriggerValue}
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
        <CreateMacroCondition
          onCreate={(condition) => createCondition(macro, condition)}
          pluginsMetadata={pluginsMetadata}
        />
        <CreateMacroAction
          onCreate={(action) => createAction(macro, action)}
          pluginsMetadata={pluginsMetadata}
        />
      </div>
      <div>
        <p>Conditions (Optional)</p>
        {(macro.conditions ?? []).map((condition) => (
          <MacroConditionPanel
            key={condition.id}
            condition={condition}
            pluginsMetadata={pluginsMetadata}
            updateMacroCondition={updateMacroCondition}
            viewOnly={activeActionOrCondition !== condition.id}
            setActiveCondition={setActiveActionOrCondition}
            deleteCondition={deleteCondition}
          />
        ))}
        <p>Actions</p>
        {macro.actions.map((action) => (
          <MacroActionPanel
            key={action.id}
            action={action}
            pluginsMetadata={pluginsMetadata}
            updateMacroAction={updateMacroAction}
            updateMacroActionEffect={updateMacroActionEffect}
            viewOnly={activeActionOrCondition !== action.id}
            setActiveAction={setActiveActionOrCondition}
            deleteAction={deleteAction}
          />
        ))}
      </div>
    </div>
  );
};
