import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { FieldDefinition, MacroActionHostModifyValue, MacroConditionAppSetting } from "common/types";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";

//TODO: refactor, this is a mess
export type DisplayFieldDefinition = FieldDefinition & {
    displayValue: any;
}

export const getMacroActionOrConditionLevaConfig = ({ value, path }: Pick<MacroConditionAppSetting | MacroActionHostModifyValue, "value" | "path">, settings: SettingsAndPluginsMeta): DisplayFieldDefinition => {

    const levaConfig = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, path);

    return {
        ...levaConfig,
        displayValue: getFieldDefinitionDisplayValue(levaConfig?.options, value),
        value
    };
}

export const getFieldDefinitionDisplayValue = (options: FieldDefinition["options"], value: any): any => {

    const displayValue =
        //@ts-ignore
        options && !Array.isArray(options)
            //@ts-ignore
            ? Object.entries(options).find(
                ([_, v]) => v === value
            )?.[0] ?? value
            : value;

    return displayValue;
}