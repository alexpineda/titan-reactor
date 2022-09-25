import { showFolderDialog } from "@ipc/dialogs";
import { createPlugin } from "leva/plugin";
import { useInputContext, Components, LevaInputProps } from "leva/plugin";

const { Row, Label, String } = Components;

type PluginProps = LevaInputProps<string>;

export default createPlugin({
  component: () => {
    const { label, displayValue, onUpdate, onChange, emitOnEditEnd } =
      useInputContext<PluginProps>();

    return (
      <>
        <Row
          input
          onClick={async () => {
            const folders = await showFolderDialog();
            if (folders && folders.length) {
              onUpdate(folders[0]);
              emitOnEditEnd();
            }
          }}
        >
          <Label>{label}</Label>
          <String
            displayValue={displayValue}
            onUpdate={onUpdate}
            onChange={onChange}
          />
        </Row>
      </>
    );
  },
});
