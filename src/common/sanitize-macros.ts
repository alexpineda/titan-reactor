import { getAppSettingsLevaConfig, getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import { MacroAction, MacroActionConfigurationErrorType, MacroActionEffect, MacroActionType, MacroDTO, MacrosDTO, SettingsMeta, TriggerType } from "common/types";
import { MacroHookTrigger } from "common/macro-hook-trigger";

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
    sanitizeMacroActionFields(action, settings);
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


const sanitizeMacroActionFields = (action: MacroAction, settings: SettingsAndPluginsMeta) => {

    if (action.type === MacroActionType.ModifyAppSettings) {
        let field = getAppSettingsLevaConfigField(settings, action.field) as any;

        const config = getAppSettingsLevaConfig(settings);


        // sane default
        if (field === undefined || action.field.length == 0) {
            field = config.sound;
            action.field = [config.sound.path, "sound"];
        }

        if (action.effect === MacroActionEffect.Set) {
            if (action.value === undefined) {
                if (field.options) {
                    action.value = field.options[0];
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
    } else if (action.type === MacroActionType.ModifyPluginSettings) {
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

        if (action.effect === MacroActionEffect.Set) {
            const field = plugin.config?.[action.field[0] as keyof typeof plugin] ?? { value: null };
            if (action.value === undefined) {
                if (field.options) {
                    action.value = field.options[0];
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

// if value type === boolean, set to default, toggle,
// if number, increase, decrease, min, max, set
// if string, set
// if method, call
export const getMacroActionValidEffects = (
    action: MacroAction,
    settings: SettingsAndPluginsMeta
): MacroActionEffect[] => {

    if (action.type === MacroActionType.ModifyAppSettings) {
        if (action.effect === MacroActionEffect.CallMethod) {
            return [];
        }

        const field = getAppSettingsLevaConfigField(settings, action.field);
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