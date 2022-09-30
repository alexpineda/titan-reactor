import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { FieldDefinition, ConditionComparator, Operator, SettingsMeta, TargetedPath } from "common/types";

export type SettingsAndPluginsMeta = Pick<SettingsMeta, "data" | "enabledPlugins">

export const getAvailableOperationsForTypeOfField = (valueType: string) => {
    if (valueType === "boolean") {
        return [
            Operator.SetToDefault,
            Operator.Set,
            Operator.Toggle,
        ];
    } else if (valueType === "number") {
        return [
            Operator.SetToDefault,
            Operator.Set,
            Operator.Increase,
            Operator.IncreaseCycle,
            Operator.Decrease,
            Operator.DecreaseCycle,
            Operator.Min,
            Operator.Max,
        ];
    } else if (valueType === "string") {
        return [Operator.SetToDefault, Operator.Set];
    }
    return [];
};

export const getAvailableComparatorsForTypeOfField = (valueType: "boolean" | "number" | "string") => {
    if (valueType === "boolean" || valueType === "string") {
        return [
            ConditionComparator.Equals,
            ConditionComparator.NotEquals,
        ];
    } else if (valueType === "number") {
        return [
            ConditionComparator.Equals,
            ConditionComparator.NotEquals,
            ConditionComparator.GreaterThan,
            ConditionComparator.GreaterThanOrEquals,
            ConditionComparator.LessThan,
            ConditionComparator.LessThanOrEquals,
        ];
    }
    return [];
};

export const getAppFieldDefinition = (settings: SettingsAndPluginsMeta, path: TargetedPath<":app">) => {

    const field = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, path.slice(1));

    if (!field) {

        return null;
    }

    return field;

}

export const getPluginFieldDefinition = (settings: SettingsAndPluginsMeta, path: TargetedPath<":plugin">) => {

    const plugin = settings.enabledPlugins.find((p) => p.name === path[1]);

    if (plugin === undefined) {
        return null;
    }

    const field = plugin.config?.[path[2] as keyof typeof plugin];

    if (field === undefined) {
        return null;
    }

    return field;

}

export const isValidTypeOfField = (type: string): type is "string" | "boolean" | "number" => {
    return type === "boolean" || type === "number" || type === "string";
}

export const getTypeOfField = (field?: FieldDefinition) => {
    if (!field) {
        return null;
    }

    const typeOfField = field?.options ? "number" : typeof field.value;
    if (!isValidTypeOfField(typeOfField)) {
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