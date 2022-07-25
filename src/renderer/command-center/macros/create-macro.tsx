import { useState } from "react";
import { MacroTriggerDTO } from "common/types";

export const CreateMacro = ({
  onCreate,
}: {
  onCreate: (name: string, trigger: MacroTriggerDTO) => void;
}) => {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<MacroTriggerDTO>({
    type: "hotkey",
    value: "",
  });

  return (
    <div>
      <h2>Create New Macro</h2>
      <div>
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
            onChange={(e) =>
              setTriggerType({ type: e.target.value, value: "" })
            }
            value={triggerType.type}
          >
            <option value="hotkey">Hotkey</option>
          </select>
        </label>

        <button
          onClick={() => {
            if (name.trim() === "") {
              return;
            }
            onCreate(name, triggerType);
          }}
        >
          Add Macro
        </button>
      </div>
    </div>
  );
};
