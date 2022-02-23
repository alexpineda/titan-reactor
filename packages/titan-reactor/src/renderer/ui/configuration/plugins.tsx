import { InitializedPluginConfiguration } from "common/types";
import { useControls } from "leva";

interface PluginConfigurationProps {
  pluginConfig: InitializedPluginConfiguration;
}
const PluginConfigurationUI = ({ pluginConfig }: PluginConfigurationProps) => {
  useControls(
    pluginConfig.userConfig || {
      value: "This plugin has no user configuration.",
      editable: false,
    },
    [pluginConfig.userConfig]
  );
  return null;
};

export default PluginConfigurationUI;
