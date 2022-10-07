import { useEffect, useRef, useState } from "react";
import {
  PluginMetaData,
  MacroDTO,
  Operator,
  ConditionComparator,
  MacroActionSequence,
} from "common/types";
import { ActionablePanel } from "./actionable-panel/actionable-panel";
import { CreateMacroConditionOrAction } from "./create-macro-condition-or-action";

import { useMacroStore } from "./use-macros-store";
import { MathUtils } from "three";
import { ConfigureTrigger } from "./configure-trigger";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { spaceOutCapitalLetters } from "@utils/string-utils";
import usePrevious from "@utils/use-previous";
import { PreviewContext } from "./PreviewContext";

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
  const { updateMacro, createActionable, deleteMacro, macros } =
    useMacroStore();
  const [activePreview, setActivePreview] = useState(false);

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

  const prevActivePreview = usePrevious(activePreview);

  useEffect(() => {
    if (activePreview && macro.actionSequence === MacroActionSequence.AllSync) {
      sendWindow(InvokeBrowserTarget.Game, {
        type: SendWindowActionType.ManualMacroTrigger,
        payload: macro.id,
      });
    } else if (!activePreview && activePreview !== prevActivePreview) {
      sendWindow(InvokeBrowserTarget.Game, {
        type: SendWindowActionType.ResetMacroActions,
        payload: macro.id,
      });
    }
  }, [activePreview, macros.revision]);

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
          gridTemplateColumns: "auto auto  1fr",
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
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => renameMacro(e.target.textContent)}
          ></span>
        </h4>

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
            alignItems: "center",
            gridTemplateColumns: "auto auto",
            gridGap: "var(--size-4)",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={activePreview}
              onChange={(e) => setActivePreview(e.target.checked)}
            />{" "}
            Active Preview{" "}
            {macro.actionSequence !== MacroActionSequence.AllSync && (
              <>(On Edit)</>
            )}
          </label>

          <button
            onClick={() => {
              sendWindow(InvokeBrowserTarget.Game, {
                type: SendWindowActionType.ManualMacroTrigger,
                payload: macro.id,
              });
            }}
          >
            Run
          </button>

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

      {macro.error && <p style={{ color: "var(--red-6)" }}>{macro.error}</p>}

      <ConfigureTrigger macro={macro} />

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
        <PreviewContext.Provider
          value={
            activePreview &&
            macro.actionSequence !== MacroActionSequence.AllSync
          }
        >
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
        </PreviewContext.Provider>
      </div>
    </div>
  );
};
