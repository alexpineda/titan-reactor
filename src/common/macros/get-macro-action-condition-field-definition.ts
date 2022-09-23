import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { MacroActionHostModifyValue, MacroConditionAppSetting } from "common/types";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";

export const getMacroActionOrConditionLevaConfig = ({ value, path }: MacroConditionAppSetting | MacroActionHostModifyValue, settings: SettingsAndPluginsMeta) => {

    const levaConfig = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, path);

    const displayValue =
        //@ts-ignore
        levaConfig?.options && !Array.isArray(levaConfig.options)
            //@ts-ignore
            ? Object.entries(levaConfig.options).find(
                ([_, v]) => v === value
            )?.[0] ?? value
            : value;

    return {
        ...levaConfig,
        displayValue,
        value
    };
}