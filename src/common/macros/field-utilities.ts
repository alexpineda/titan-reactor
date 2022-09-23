import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { FieldDefinition, MacroAction, MacroActionType, MacroCondition, MacroConditionComparator, MutationInstruction, SettingsMeta } from "common/types";

export type SettingsAndPluginsMeta = Pick<SettingsMeta, "data" | "enabledPlugins">

export const getAvailableMutationIntructionsForTypeOfField = (valueType: "boolean" | "number" | "string") => {
    if (valueType === "boolean") {
        return [
            MutationInstruction.SetToDefault,
            MutationInstruction.Set,
            MutationInstruction.Toggle,
        ];
    } else if (valueType === "number") {
        return [
            MutationInstruction.SetToDefault,
            MutationInstruction.Set,
            MutationInstruction.Increase,
            MutationInstruction.IncreaseCycle,
            MutationInstruction.Decrease,
            MutationInstruction.DecreaseCycle,
            MutationInstruction.Min,
            MutationInstruction.Max,
        ];
    } else if (valueType === "string") {
        return [MutationInstruction.SetToDefault, MutationInstruction.Set];
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

export const getAppFieldDefinition = (settings: SettingsAndPluginsMeta, path: string[]) => {

    const field = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, path);

    if (!field) {
        return null;
    }

    return field;

}

export const getPluginFieldDefinition = (settings: SettingsAndPluginsMeta, path: string[]) => {

    const plugin = settings.enabledPlugins.find((p) => p.name === path[0]);

    if (plugin === undefined) {
        return null;
    }

    const field = plugin.config?.[path[1] as keyof typeof plugin];

    if (field === undefined) {
        return null;
    }

    return field;

}

export const isValidTypeOfField = (type: string): type is "string" | "boolean" | "number" => {
    return type === "boolean" || type === "number" || type === "string";
}

export const getTypeOfField = (field?: FieldDefinition) => {
    if (field === undefined) {
        return null;
    }

    const typeOfField = field?.options ? "number" : typeof field.value;
    if (!isValidTypeOfField(typeOfField)) {
        console.warn(`Unsupported field type: ${typeOfField}`);
        return null;
    }
    return typeOfField;
}

export const getFieldDefinitionDisplayValue = (options: FieldDefinition["options"], value: any): any => {

    const displayValue =
        options && !Array.isArray(options)
            ? Object.entries(options).find(
                ([_, v]) => v === value
            )?.[0] ?? value
            : value;

    return displayValue;
}

export const getAvailableMutationInstructionsForAction = (
    action: MacroAction,
    settings: SettingsAndPluginsMeta
): MutationInstruction[] => {

    if (action.type === MacroActionType.CallGameTimeApi) {
        return [];
    } else {

        const typeOfField = getTypeOfField(action.type === MacroActionType.ModifyAppSettings ? getAppFieldDefinition(settings, action.path) : getPluginFieldDefinition(settings, action.path));

        if (typeOfField === null) {
            return [];
        }

        return getAvailableMutationIntructionsForTypeOfField(typeOfField);
    }

};


export const getMacroConditionValidComparators = (
    condition: MacroCondition,
    settings: SettingsAndPluginsMeta
): MacroConditionComparator[] => {


    if (condition.type === "FunctionCondition") {
        return getMacroConditionValueValidComparitors("number");
    } else {

        const typeOfField = getTypeOfField(condition.type === "AppSettingsCondition" ? getAppFieldDefinition(settings, condition.path) : getPluginFieldDefinition(settings, condition.path));

        if (typeOfField === null) {
            return [];
        }

        return getMacroConditionValueValidComparitors(typeOfField);
    }

};