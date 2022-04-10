import { InitializedPluginPackage } from "common/types";
import DetailSheet from "./detail-sheet";
import groupBy from "lodash.groupby";
import keyboardShortcut from "../leva-plugins/keyboard-shortcut";
import ErrorBoundary from "./error-boundary";
import { Leva } from "leva";
import { AnyColor } from "colord";

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
          onChange: (value: any, _: any, input: { initial: boolean }) => {
            if (config[k].value !== value && !input.initial) {
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

  return (
    <ErrorBoundary>
      <Leva
        fill
        flat
        hideCopyButton
        titleBar={false}
        theme={{
          colors: {
            accent1: "blue",
            accent2: "orange",
            accent3: "red",
            elevation1: "red",
            elevation2: "#f5f5f5",
            elevation3: "#d9e0f0",
            highlight1: "black",
            highlight2: "#222",
            highlight3: "#333",
            vivid1: "red",
          },
          sizes: {
            controlWidth: "40vw",
          },
          fontSizes: {
            root: "14px",
          },
        }}
      />
      <DetailSheet
        pluginConfig={pluginPackage}
        controls={mapChangeFn(pluginPackage.config)}
      />
    </ErrorBoundary>
  );
};

export default PluginConfigurationUI;
