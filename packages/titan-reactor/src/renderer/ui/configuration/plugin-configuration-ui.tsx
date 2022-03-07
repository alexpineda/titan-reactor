import { InitializedPluginPackage } from "common/types";
import { useControls } from "leva";

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
      obj[k] = { ...config[k] };
      obj[k].onChange = (value: any) => {
        if (config[k].value !== value) {
          config[k].value = value;
          obj[k].value = value;
          onChange(pluginConfig.id, config);
        }
      };
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

  return (
    <div>
      <p>
        <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
        {pluginConfig.version}
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
        {pluginConfig.author ?? "unknown"}
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Name:</span>{" "}
        {pluginConfig.name ?? "error: name is required in plugin.json"}
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Update Status:</span>
        {pluginConfig.repository
          ? "up to date"
          : "package.json has no repository field"}
      </p>
    </div>
  );
};

export default PluginConfigurationUI;
