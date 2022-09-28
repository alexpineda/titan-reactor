import { useState } from "react";
import { Actionable, MacroDTO } from "common/types";
import { useMacroStore } from "../use-macros-store";
import { ScriptInline } from "../../script-inline";
import debounce from "lodash.debounce";

const debouncedUpdateActionable = debounce(
  useMacroStore.getState().updateActionable,
  500
);

export const ActionableTargetFunction = ({
  macro,
  action,
}: {
  macro: MacroDTO;
  action: Actionable;
}) => {
  const [value, setValue] = useState(action.value);

  return (
    <p
      style={{
        display: "grid",
        gridGap: "var(--size-1)",
      }}
    >
      <ScriptInline
        content={value}
        onChange={(content) => {
          setValue(content);
          debouncedUpdateActionable(macro, { ...action, value: content });
        }}
      />
    </p>
  );
};
