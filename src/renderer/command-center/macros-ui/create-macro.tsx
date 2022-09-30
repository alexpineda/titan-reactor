import { useState } from "react";
import { TriggerType } from "common/types";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { ManualTrigger } from "@macros/manual-trigger";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { useMacroStore } from "./use-macros-store";

export const CreateMacro = ({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) => {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>(
    TriggerType.Hotkey
  );

  const { createMacro } = useMacroStore();

  return (
    <div
      style={{
        padding: "var(--size-3)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gridGap: "var(--size-3)",
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        <label>
          Name:
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </label>

        <label>
          Trigger Type:
          <select
            onChange={(e) => {
              const type =
                TriggerType[e.target.value as keyof typeof TriggerType];
              setTriggerType(type);
            }}
            value={triggerType}
          >
            {Object.keys(TriggerType).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={async () => {
            if (name.trim() === "") {
              return;
            }
            let trigger:
              | ManualTrigger
              | HotkeyTrigger
              | MouseTrigger
              | WorldEventTrigger = new ManualTrigger();
            if (triggerType === TriggerType.Hotkey) {
              trigger = new HotkeyTrigger();
            } else if (triggerType === TriggerType.Mouse) {
              trigger = new MouseTrigger();
            } else if (triggerType === TriggerType.WorldEvent) {
              trigger = new WorldEventTrigger();
            }
            const id = await createMacro(name, trigger);
            onCreated(id);
            setName("");
          }}
        >
          + Macro
        </button>
      </div>
    </div>
  );
};
