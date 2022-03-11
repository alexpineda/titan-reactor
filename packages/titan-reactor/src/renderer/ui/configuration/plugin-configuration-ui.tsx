import { InitializedPluginPackage } from "common/types";
import { useControls } from "leva";
import DetailSheet from "./detail-sheet";

interface PluginConfigurationProps {
  pluginConfig: InitializedPluginPackage;
  onChange: (pluginId: string, value: any) => void;
}

const PluginConfigurationUI = ({
  pluginConfig,
  onChange,
}: PluginConfigurationProps) => {
  const mapChangeFn = (config: any) => {
    if (!config) {
      return null;
    }

    const obj: any = {};

    for (const k in config) {
      if (typeof config[k] === "object" && "value" in config[k]) {
        obj[k] = { ...config[k] };
        obj[k].onChange = (value: any) => {
          if (config[k].value !== value) {
            config[k].value = value;
            obj[k].value = value;
            onChange(pluginConfig.id, config);
          }
        };
      }
    }
    return obj;
  };

  const userConfig = mapChangeFn(pluginConfig.config) ?? {
    "N/A": {
      value: "This plugin has no user configuration.",
      editable: false,
    },
  };

  useControls(userConfig, [userConfig]);

  return <DetailSheet pluginConfig={pluginConfig} />;
};

export default PluginConfigurationUI;
