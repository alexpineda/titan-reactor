import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import { MacroAction, MacroActionConfigurationErrorType, MacroActionEffect, MacroActionHostModifyValue, MacroActionType, MacroCondition, MacroConditionAppSetting, MacroConditionComparator, MacroDTO, MacrosDTO, SettingsMeta, TriggerType } from "common/types";
import { MacroHookTrigger } from "@macros/macro-hook-trigger";

type SettingsAndPluginsMeta = Pick<SettingsMeta, "data" | "enabledPlugins">


const getPluginConfigFields = (config: any) => {
    return Object.keys(config).filter(k => k !== "system")
}

export const sanitizeMacros = (macros: MacrosDTO, settings: SettingsAndPluginsMeta) => {
    const hotkeys = new Set<string>();

    for (const macro of macros.macros) {
        delete macro.error;
        if (macro.trigger.type === TriggerType.Hotkey) {
            if (macro.trigger.value) {
                if (hotkeys.has(macro.trigger.value)) {
                    macro.error = "Duplicate hotkey";
                } else {
                    hotkeys.add(macro.trigger.value);
                }
            }
        }
        sanitizeMacro(macro, settings);
        for (const action of macro.actions) {
            sanitizeMacroAction(action, settings);
        }

        for (const condition of macro.conditions) {
            sanitizeMacroCondition(condition, settings);
        }

    }
    return macros;
}

const sanitizeMacro = (macro: MacroDTO, settings: SettingsAndPluginsMeta) => {
    if (macro.trigger.type === TriggerType.GameHook) {
        const d = MacroHookTrigger.deserialize(macro.trigger);
        if (d !== undefined && d.pluginName && settings.enabledPlugins.find(p => p.name === d.pluginName) === undefined) {
            macro.error = `Plugin for game hook trigger not found - ${d.pluginName}`;
        }
    }
}

const sanitizeMacroAction = (action: MacroAction, settings: SettingsAndPluginsMeta) => {
    delete action.error;
    sanitizeMacroActionEffects(action, settings);
    sanitizeMacroActionOrConditionFields(action, settings);
}

const sanitizeMacroCondition = (condition: MacroCondition, settings: SettingsAndPluginsMeta) => {
    delete condition.error;
    sanitizeMacroConditionComparators(condition, settings);
    sanitizeMacroActionOrConditionFields(condition, settings);
}

const sanitizeMacroActionEffects = (action: MacroAction, settings: SettingsAndPluginsMeta) => {
    if (action.type === MacroActionType.ModifyAppSettings || action.type === MacroActionType.ModifyPluginSettings) {

        const validEffects = getMacroActionValidEffects(action, settings);
        if (!validEffects.includes(action.effect)) {
            action.effect = validEffects[0];
        }

        if (action.effect !== MacroActionEffect.Set && action.effect !== MacroActionEffect.Toggle) {
            delete action.value;
        }
    }
}

const sanitizeMacroConditionComparators = (condition: MacroCondition, settings: SettingsAndPluginsMeta) => {
    if (condition.type === "AppSettingsCondition" || condition.type === "PluginSettingsCondition") {

        const validComparators = getMacroConditionValidComparators(condition, settings);
        if (!validComparators.includes(condition.comparator)) {
            condition.comparator = validComparators[0];
        }

    }
}

const sanitizeMacroActionOrConditionFields = (action: MacroAction | MacroCondition, settings: SettingsAndPluginsMeta) => {

    if (action.type === MacroActionType.ModifyAppSettings || action.type === "AppSettingsCondition") {
        let field = getAppSettingsLevaConfigField(settings.data, settings.enabledPlugins, action.field) as any;

        // sane default
        if (field === undefined || action.field.length == 0) {
            return;
        }

        const assignProperValue = action.type === MacroActionType.ModifyAppSettings && action.effect === MacroActionEffect.Set || action.type === "AppSettingsCondition";
        if (assignProperValue) {
            if (action.value === undefined) {
                if (field.options) {
                    action.value = getFirstOption(field);
                } else {
                    action.value = field.value;
                }
            }
            const typeOfField = typeof action.value;
            if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
                action.error = {
                    type: MacroActionConfigurationErrorType.InvalidFieldValue,
                    message: `Invalid field type: ${JSON.stringify(action)}`
                }
            }
        }
    } else if (action.type === MacroActionType.ModifyPluginSettings || action.type === "PluginSettingsCondition") {
        const plugin = settings.enabledPlugins.find((p) => p.name === action.pluginName);
        if (!plugin) {
            action.error = {
                type: MacroActionConfigurationErrorType.MissingPlugin,
                message: `Missing plugin ${action.pluginName}`,
            }
            return;
        }

        if (!action.field || action.field.length === 0) {
            let replaced: string | undefined;
            if (plugin.methods.length) {
                replaced = plugin.methods[0];
            } else if (plugin.config) {
                replaced = Object.keys(plugin.config!).find(k => k !== "system");
            }
            if (replaced) {
                action.field = [replaced]
            }
            // failed to properly assign a field even though the config is available and/or plugins methods are available
            else if (getPluginConfigFields(plugin.config).length || plugin.methods.length) {
                action.error = {
                    type: MacroActionConfigurationErrorType.MissingField,
                    message: `Missing field for plugin`,
                }
                return;
            }
            return;
        }

        if (action.field[0].startsWith("onMacro") && !plugin.methods.includes(action.field[0])) {
            action.error = {
                type: MacroActionConfigurationErrorType.MissingField,
                message: `Missing field for plugin ${action.pluginName} ${action.field[0]}`,
            }
            return;
        }

        const checkField = action.type === MacroActionType.ModifyPluginSettings && action.effect === MacroActionEffect.Set || action.type === "PluginSettingsCondition";
        if (checkField) {
            const field = plugin.config?.[action.field[0] as keyof typeof plugin] ?? { value: null };
            if (action.value === undefined) {
                if (field.options) {
                    action.value = getFirstOption(field);
                } else {
                    action.value = field.value;
                }
            }
            const typeOfField = typeof action.value;
            if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
                action.error = {
                    type: MacroActionConfigurationErrorType.InvalidFieldValue,
                    message: `Invalid field type: ${typeOfField}`
                }
            }
        }
    }
}

export const getMacroActionValidModifyEffects = (valueType: "boolean" | "number" | "string") => {
    if (valueType === "boolean") {
        return [
            MacroActionEffect.SetToDefault,
            MacroActionEffect.Set,
            MacroActionEffect.Toggle,
        ];
    } else if (valueType === "number") {
        return [
            MacroActionEffect.SetToDefault,
            MacroActionEffect.Set,
            MacroActionEffect.Increase,
            MacroActionEffect.IncreaseCycle,
            MacroActionEffect.Decrease,
            MacroActionEffect.DecreaseCycle,
            MacroActionEffect.Min,
            MacroActionEffect.Max,
        ];
    } else if (valueType === "string") {
        return [MacroActionEffect.SetToDefault, MacroActionEffect.Set];
    }
    return [];
};


export const getMacroActionValidEffects = (
    action: MacroAction,
    settings: SettingsAndPluginsMeta
): MacroActionEffect[] => {

    if (action.type === MacroActionType.ModifyAppSettings) {
        if (action.effect === MacroActionEffect.CallMethod) {
            return [];
        }

        const field = getAppSettingsLevaConfigField(settings.data, settings.enabledPlugins, action.field);
        if (!field) {
            return [];
        }

        //@ts-ignore
        const typeOfField = field?.options ? "number" : typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return getMacroActionValidModifyEffects(typeOfField);
    } else if (action.type === MacroActionType.CallGameTimeApi) {
        return [MacroActionEffect.CallMethod];
    } else if (action.type === MacroActionType.ModifyPluginSettings) {
        const plugin = settings.enabledPlugins.find((p) => p.name === action.pluginName);
        if (!plugin) {
            return [];
        }

        const callMethod = plugin.methods.includes(action.field[0]) ? [MacroActionEffect.CallMethod] : [];

        const field = plugin.config?.[action.field[0] as keyof typeof plugin];
        if (field === undefined) {
            return callMethod;
        }
        const typeOfField = typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return [...callMethod, ...getMacroActionValidModifyEffects(typeOfField)];
    }
    return [];
};


export const getMacroConditionValidComparators = (
    condition: MacroCondition,
    settings: SettingsAndPluginsMeta
): MacroConditionComparator[] => {

    if (condition.type === "AppSettingsCondition") {
        const field = getAppSettingsLevaConfigField(settings.data, settings.enabledPlugins, condition.field);
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
        const plugin = settings.enabledPlugins.find((p) => p.name === condition.pluginName);
        if (!plugin) {
            return [];
        }

        const callMethod = plugin.methods.includes(condition.field[0]) ? getMacroConditionValueValidComparitors("number") : null;

        const field = plugin.config?.[condition.field[0] as keyof typeof plugin];
        if (field === undefined) {
            return callMethod ?? [];
        }
        const typeOfField = typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return callMethod ?? getMacroConditionValueValidComparitors(typeOfField);
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

export const getFirstOption = (levaFieldConfig: { options: any[] }) => {
    return !Array.isArray(levaFieldConfig.options) ? Object.values(levaFieldConfig.options)[0] : levaFieldConfig.options[0];
}

export const getMacroActionOrConditionLevaConfig = ({ value, field }: MacroConditionAppSetting | MacroActionHostModifyValue, settings: SettingsAndPluginsMeta) => {

    const levaConfig = getAppSettingsLevaConfigField(settings.data, settings.enabledPlugins, field);

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