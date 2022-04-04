import { InitializedPluginPackage } from "common/types";
import { useControls } from "leva";
import DetailSheet from "./detail-sheet";
import groupBy from "lodash.groupby";

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
        const obj = {
          ...config[k],
          folder: config[k].folder || "Configuration",
          _key: k,
        };
        obj.onChange = (value: any) => {
          if (config[k].value !== value) {
            config[k].value = value;
            obj.value = value;
            onChange(pluginPackage.id, config);
          }
        };
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
