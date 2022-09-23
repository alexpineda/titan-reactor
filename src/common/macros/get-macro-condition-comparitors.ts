import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { MacroCondition, MacroConditionComparator } from "common/types";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";

export const getMacroConditionValidComparators = (
    condition: MacroCondition,
    settings: SettingsAndPluginsMeta
): MacroConditionComparator[] => {

    if (condition.type === "AppSettingsCondition") {
        const field = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, condition.path);
        if (!field) {
            return [];
        }

        //@ts-ignore
        const typeOfField = field?.options ? "number" : typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return getMacroConditionValueValidComparitors(typeOfField);
    } else if (condition.type === "FunctionCondition") {
        // all of them, eg. same as number
        return getMacroConditionValueValidComparitors("number");
    } else if (condition.type === "PluginSettingsCondition") {
        const plugin = settings.enabledPlugins.find((p) => p.name === condition.path[0]);
        if (!plugin) {
            return [];
        }

        const field = plugin.config?.[condition.path[1] as keyof typeof plugin];
        if (field === undefined) {
            return [];
        }
        const typeOfField = typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return getMacroConditionValueValidComparitors(typeOfField);
    }
    return [];
};

export const getMacroConditionValueValidComparitors = (valueType: "boolean" | "number" | "string") => {
    if (valueType === "boolean" || valueType === "string") {
        return [
            MacroConditionComparator.Equals,
            MacroConditionComparator.NotEquals,
        ];
    } else if (valueType === "number") {
        return [
            MacroConditionComparator.Equals,
            MacroConditionComparator.NotEquals,
            MacroConditionComparator.GreaterThan,
            MacroConditionComparator.GreaterThanOrEquals,
            MacroConditionComparator.LessThan,
            MacroConditionComparator.LessThanOrEquals,
        ];
    }
    return [];
};