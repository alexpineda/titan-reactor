import { InitializedPluginPackage } from "common/types";
import { useControls } from "leva";
import DetailSheet from "./detail-sheet";
import groupBy from "lodash.groupby";
import keyboardShortcut from "../leva-plugins/keyboard-shortcut";

interface PluginConfigurationProps {
  pluginPackage: InitializedPluginPackage;
  onChange: (pluginId: string, value: any) => void;
}

const PluginConfigurationUI = ({
  pluginPackage,
  onChange,
}: PluginConfigurationProps) => {
  // copy the object and add onChange hooks so we can read changes and update the pluginConfig
  const mapChangeFn = (config: any) => {
    const values = [];
    for (const k in config || {}) {
      if (
        k !== "system" &&
        typeof config[k] === "object" &&
        "value" in config[k]
      ) {
        let wrapper = (input: any) => input;
        if (config[k].type === "keyboard-shortcut") {
          wrapper = keyboardShortcut;
        }

        const obj = wrapper({
          ...config[k],
          onChange: (value: any) => {
            console.log("changed", value);
            if (config[k].value !== value) {
              config[k].value = value;
              onChange(pluginPackage.id, config);
            }
          },
        });

        obj.folder = config[k].folder || "Configuration";
        obj._key = k;
        values.push(obj);
      }
    }
    const grouped = groupBy(values, "folder");
    return Object.keys(grouped).map((folder) => [
      folder,
      grouped[folder].reduce((acc, v) => ({ ...acc, [v._key]: v }), {}),
    ]);
  };

  for (const [folder, data] of mapChangeFn(pluginPackage.config)) {
    useControls(folder, data);
  }

  return <DetailSheet pluginConfig={pluginPackage} />;
};

export default PluginConfigurationUI;
