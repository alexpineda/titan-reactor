import { MacroAction, MacroActionConfigurationErrorType, MacroActionType, MacroCondition, ConditionComparator, MacrosDTO, TriggerType } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { logService } from "main/logger/singleton";
import { FieldDefinition, MutationInstruction } from "../types/mutations";
import { getAppFieldDefinition, getAvailableMutationInstructionsForAction, SettingsAndPluginsMeta, getMacroConditionValidComparators, isValidTypeOfField } from "./field-utilities";

const getPluginConfigFields = (config: any) => {
    return Object.keys(config).filter(k => k !== "system")
}

export const sanitizeMacros = (macros: MacrosDTO, settings: SettingsAndPluginsMeta) => {
    const hotkeys = new Set<string>();

    try {
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

            for (const action of macro.actions) {

                sanitizeMacroAction(action, settings);

            }

            for (const condition of macro.conditions) {

                sanitizeMacroCondition(condition, settings);

            }

        }
    } catch (e) {
        logService.error(withErrorMessage(e, "Failed to sanitize macros"));
    }
    return macros;
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

        // patch instruction
        const validInstructions = getAvailableMutationInstructionsForAction(action, settings);

        if (!validInstructions.includes(action.instruction)) {

            action.instruction = MutationInstruction.SetToDefault;

        }

    }

}

const sanitizeMacroConditionComparators = (condition: MacroCondition, settings: SettingsAndPluginsMeta) => {

    if (condition.type === "AppSettingsCondition" || condition.type === "PluginSettingsCondition") {

        // patch comparitor
        const validComparators = getMacroConditionValidComparators(condition, settings);

        if (!validComparators.includes(condition.comparator)) {

            condition.comparator = ConditionComparator.Equals

        }

    }
}

const sanitizeMacroActionOrConditionFields = (action: MacroAction | MacroCondition, settings: SettingsAndPluginsMeta) => {

    if (action.type === MacroActionType.ModifyAppSettings || action.type === "AppSettingsCondition") {

        let field = getAppFieldDefinition(settings, action.path);

        if (field === null) {
            action.error = {
                type: MacroActionConfigurationErrorType.InvalidField,
                message: "No field definition"
            }
            return;
        }

        // how do we know if its patchable?
        const patchable = action.type === MacroActionType.ModifyAppSettings && action.instruction === MutationInstruction.Set || action.type === "AppSettingsCondition";

        if (patchable) {

            patchValue(action, field);

        }

    } else if (action.type === MacroActionType.ModifyPluginSettings || action.type === "PluginSettingsCondition") {

        const plugin = settings.enabledPlugins.find((p) => p.name === action.path[0]);

        if (!plugin) {

            action.error = {
                type: MacroActionConfigurationErrorType.MissingPlugin,
                message: `Missing plugin ${action.path[0]}`,
            }
            return;

        }

        // patch path
        if (!action.path || action.path.length === 0) {

            let replaced: string | undefined;
            if (plugin.externMethods.length) {
                replaced = plugin.externMethods[0];
            } else if (plugin.config) {
                replaced = Object.keys(plugin.config!).find(k => k !== "system");
            }
            if (replaced) {
                action.path = [plugin.name, replaced]
            }
            // failed to properly assign a field even though the config is available and/or plugins methods are available
            else if (getPluginConfigFields(plugin.config).length || plugin.externMethods.length) {
                action.error = {
                    type: MacroActionConfigurationErrorType.MissingField,
                    message: `Missing field for plugin`,
                }
                return;
            }
            return;

        }

        if (action.path[1].startsWith("externMethod") && !plugin.externMethods.includes(action.path[1])) {
            action.error = {
                type: MacroActionConfigurationErrorType.MissingField,
                message: `Missing field for plugin ${action.path[0]} ${action.path[1]}`,
            }
            return;
        }

        const patchable = action.type === MacroActionType.ModifyPluginSettings && action.instruction === MutationInstruction.Set || action.type === "PluginSettingsCondition";

        if (patchable) {

            const field = plugin.config?.[action.path[1] as keyof typeof plugin] ?? { value: null };

            patchValue(action, field);

        }
    }
}


const getFirstOption = (options: Required<FieldDefinition>["options"]) => {

    return !Array.isArray(options) ? Object.values(options)[0] : options[0];

}


const patchValue = (action: MacroAction | MacroCondition, field: FieldDefinition) => {

    if (action.value === undefined) {
        if (field.options) {
            action.value = getFirstOption(field.options);
        } else {
            action.value = field.value;
        }
    }

    if (!isValidTypeOfField(typeof action.value)) {
        action.error = {
            type: MacroActionConfigurationErrorType.InvalidFieldValue,
            message: `Invalid field type`
        }
    }

}