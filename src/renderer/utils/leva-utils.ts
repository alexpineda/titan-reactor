import groupBy from "lodash.groupby";
import keyboardShortcut from "../command-center/leva-plugins/keyboard-shortcut";
import directory from "../command-center/leva-plugins/directory";

export const mapSingleConfigToLeva = (fieldConfig: any, onChange: (value: any, key?: string) => void, key?: string, overwriteOnChange = true) => {
    let wrapper = (input: any) => input;
    if (fieldConfig.type === "keyboard-shortcut") {
        wrapper = keyboardShortcut;
    } else if (fieldConfig.type === "directory") {
        wrapper = directory;
    }

    return wrapper({
        ...fieldConfig,
        onChange: (!overwriteOnChange && fieldConfig.onChange) ? fieldConfig.onChange : (value: any, _: any, input: { initial: boolean }) => {
            if (fieldConfig.value !== value && !input.initial) {
                fieldConfig.value = value;
                onChange(value, key);
            }
        },
    });
}

export const attachOnChangeAndGroupByFolder = ({
    config,
    onChange,
    overwriteOnChange = true,
    groupByFolder = true
}: { config: any, onChange: (value: any, key?: string) => void, overwriteOnChange?: boolean, groupByFolder?: boolean }) => {
    const values = [];
    for (const k in config || {}) {
        if (
            k !== "system" &&
            typeof config[k] === "object" &&
            "value" in config[k]
        ) {
            const obj = mapSingleConfigToLeva(config[k], onChange, k, overwriteOnChange);

            obj.folder = config[k].folder || "Configuration";
            obj._key = k;
            values.push(obj);
        }
    }
    if (groupByFolder) {
        const grouped = groupBy(values, "folder");
        return Object.keys(grouped).map((folder) => [
            folder,
            grouped[folder].reduce((acc, v) => ({ ...acc, [v._key]: v }), {}),
        ]);
    } else {
        return values.reduce((acc, v) => ({ ...acc, [v._key]: v }), {});
    }
};

export const simplifyLevaConfig = (config: Record<string, any>) => {

    const values: Record<string, any> = {};
    for (const k in config) {
        if (
            k !== "system" &&
            typeof config[k] === "object" &&
            "value" in config[k as keyof typeof config]
        ) {
            values[k] = (config[k as keyof typeof config].value);
        }
    }
    return values;
}