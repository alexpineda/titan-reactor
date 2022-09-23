import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { FieldDefinition, MacroActionHostModifyValue, MacroConditionAppSetting } from "common/types";
import { getFieldDefinitionDisplayValue, SettingsAndPluginsMeta } from "./field-utilities";

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