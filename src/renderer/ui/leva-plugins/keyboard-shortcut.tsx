import { createPlugin } from "leva/plugin";
import { useInputContext, Components, LevaInputProps } from "leva/plugin";

const { Row, Label, String } = Components;

type PluginProps = LevaInputProps<string>;

const forbidden = ["Escape", "Enter"];

const Plugin = () => {
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
            if (!forbidden.includes(e.code)) {
              onUpdate(e.code);
              emitOnEditEnd();
            }
          }}
        />
      </Row>
    </>
  );
};

export default createPlugin({
  component: Plugin,
});
