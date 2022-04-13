import { createPlugin } from "leva/plugin";
import { useInputContext, Components, LevaInputProps } from "leva/plugin";

const { Row, Label, String } = Components;

type PluginProps = LevaInputProps<string>;

const forbidden = [
  "ShiftLeft",
  "ShiftRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
  "ControlLeft",
  "ControlRight",
  "Tab",
];

export default createPlugin({
  component: () => {
    const { label, displayValue, onUpdate, onChange, emitOnEditEnd } =
      useInputContext<PluginProps>();
  
    return (
      <>
        <Row input>
          <Label>{label}</Label>
          <String
            displayValue={displayValue}
            onUpdate={onUpdate}
            onChange={onChange}
            onKeyDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.code=== "Delete") {
                onUpdate("");
                emitOnEditEnd();
              } else if (!forbidden.includes(e.code)) {
                onUpdate(e.code);
                emitOnEditEnd();
              }
            }}
          />
        </Row>
      </>
    );
  }
});
