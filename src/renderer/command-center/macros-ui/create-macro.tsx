import { useState } from "react";
import { MacroTriggerDTO, TriggerType } from "common/types";

export const CreateMacro = ({
  onCreate,
}: {
  onCreate: (name: string, trigger: MacroTriggerDTO) => void;
}) => {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<MacroTriggerDTO>({
    type: TriggerType.Manual,
  });

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
        <h3>Macros</h3>

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
              setTriggerType({ type });
            }}
            value={triggerType.type}
          >
            {Object.keys(TriggerType).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            if (name.trim() === "") {
              return;
            }
            onCreate(name, triggerType);
            setName("");
          }}
        >
          + Macro
        </button>
      </div>
    </div>
  );
};
