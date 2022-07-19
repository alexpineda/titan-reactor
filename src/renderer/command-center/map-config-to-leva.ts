import groupBy from "lodash.groupby";
import keyboardShortcut from "./leva-plugins/keyboard-shortcut";
import directory from "./leva-plugins/directory";

export const mapConfigToLeva = (pluginId: string, config: any, onChange: (pluginId: string, value: any) => void) => {
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
            } else if (config[k].type === "directory") {
                wrapper = directory;
            }

            const obj = wrapper({
                ...config[k],
                onChange: (value: any, _: any, input: { initial: boolean }) => {
                    if (config[k].value !== value && !input.initial) {
                        config[k].value = value;
                        onChange(pluginId, config);
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