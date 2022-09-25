import { Logger } from "common/logging";
import { MacroAction, MacroActionConfigurationErrorType, MacroCondition, ConditionComparator, MacrosDTO, TargetedPath } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { FieldDefinition, Operator } from "../types/mutations";
import { getAppFieldDefinition, SettingsAndPluginsMeta, getTypeOfField, getPluginFieldDefinition, getAvailableMutationIntructionsForTypeOfField, getAvailableComparatorsForTypeOfField, isValidTypeOfField } from "./field-utilities";

export const sanitizeMacros = (macros: MacrosDTO, settings: SettingsAndPluginsMeta, logger?: Logger) => {

    for (const macro of macros.macros) {

        delete macro.error;

        for (const action of macro.actions) {

            try {

                delete action.error;

                patchMutationInstruction(action, settings);

                sanitizeMacroActionOrConditionFields(action, settings);

            } catch (e) {

                logger && logger.error(withErrorMessage(e, `Error while sanitizing macro action ${action.id}`));

                action.error = {
                    type: MacroActionConfigurationErrorType.InvalidAction,
                    message: "Program error"
                }

            }

        }

        for (const condition of macro.conditions) {

            try {

                delete condition.error;

                patchConditionComparator(condition, settings);

                sanitizeMacroActionOrConditionFields(condition, settings);

            } catch (e) {

                logger && logger.error(withErrorMessage(e, `Error while sanitizing macro action ${condition.id}`));

                condition.error = {
                    type: MacroActionConfigurationErrorType.InvalidCondition,
                    message: "Program error"
                }

            }

        }

    }
    return macros;
}

const shouldHaveValue = (action: MacroAction | MacroCondition) => {

    if (action.type === "action" && action.operator === Operator.Set) {
        return true;
    } else if (action.type === "condition") {
        return true;
    }

    return false;

}

const sanitizeMacroActionOrConditionFields = (action: MacroAction | MacroCondition, settings: SettingsAndPluginsMeta) => {

    // we don't sanitize these types
    if (action.path[0] === ":function") {
        return;
    }

    if (action.path[0] === ":app") {

        // validate path
        const field = getAppFieldDefinition(settings, action.path as TargetedPath<":app">);

        if (!field) {

            action.error = {
                type: MacroActionConfigurationErrorType.InvalidField,
                message: "No field definition"
            }
            return;

        }

        if (shouldHaveValue(action)) {

            patchValue(action, field);

        }

    } else if (action.path[0] === ":plugin") {

        const plugin = settings.enabledPlugins.find((p) => p.name === action.path[1]);

        if (!plugin) {

            action.error = {
                type: MacroActionConfigurationErrorType.MissingPlugin,
                message: `Missing plugin ${action.path[1]}`,
            }
            return;

        }

        if (action.path[2].startsWith("externMethod") && !plugin.externMethods.includes(action.path[2])) {

            action.error = {
                type: MacroActionConfigurationErrorType.MissingField,
                message: `Missing field for plugin ${action.path[1]} ${action.path[2]}`,
            }

            return;

        }

        if (shouldHaveValue(action)) {

            const field = plugin.config?.[action.path[2] as keyof typeof plugin] ?? { value: null };

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
            message: "Invalid field type"
        }
    }

}


const patchMutationInstruction = (action: MacroAction, settings: SettingsAndPluginsMeta) => {


    const validInstructions = getAvailableMutationInstructionsForAction(action, settings);

    if (!validInstructions.includes(action.operator)) {

        action.operator = Operator.SetToDefault;
        action.error = {
            type: MacroActionConfigurationErrorType.InvalidInstruction,
            message: "This action had an invalid instruction and was reset to the default"
        };

    }


};

const patchConditionComparator = (condition: MacroCondition, settings: SettingsAndPluginsMeta) => {

    const validComparators = getMacroConditionValidComparators(condition, settings);

    if (!validComparators.includes(condition.comparator)) {

        condition.comparator = ConditionComparator.Equals;
        condition.error = {

            type: MacroActionConfigurationErrorType.InvalidCondition,
            message: "This condition had an invalid comparator and was reset to the default"

        };

    }

}

export const getAvailableMutationInstructionsForAction = (
    action: MacroAction,
    settings: SettingsAndPluginsMeta
): Operator[] => {

    if (action.path[0] === ":function") {
        return [Operator.Execute];
    } else {

        const typeOfField = getTypeOfField(action.path[0] === ":app" ? getAppFieldDefinition(settings, action.path as TargetedPath<":app">) : getPluginFieldDefinition(settings, action.path as TargetedPath<":plugin">));

        if (typeOfField === null) {
            return [];
        }

        return getAvailableMutationIntructionsForTypeOfField(typeOfField);
    }

};


export const getMacroConditionValidComparators = (
    condition: MacroCondition,
    settings: SettingsAndPluginsMeta
): ConditionComparator[] => {


    if (condition.path[0] === ":function") {
        return getAvailableComparatorsForTypeOfField("number");
    } else {

        const typeOfField = getTypeOfField(condition.path[0] === ":app" ? getAppFieldDefinition(settings, condition.path as TargetedPath<":app">) : getPluginFieldDefinition(settings, condition.path as TargetedPath<":plugin">));

        if (typeOfField === null) {
            return [];
        }

        return getAvailableComparatorsForTypeOfField(typeOfField);
    }

};


export function saneDefaultsForNewMacroActionOrCondition<T extends MacroAction | MacroCondition>(action: T, settings: SettingsAndPluginsMeta) {


    if (action.path.length === 0) {

        action.path = [":app"];

    }

    if (action.path[0] === ":app") {

        action.path = [":app", "audio", "music"];

    } else if (action.path[0] === ":plugin") {

        if (settings.enabledPlugins.length > 0) {

            const plugin = settings.enabledPlugins[0];
            const fieldName = Object.keys(plugin.config ?? {}).find(k => k !== "system");

            action.path = [":plugin", plugin.name];

            if (fieldName) {
                action.path.push(fieldName);
            } else if (plugin.externMethods.length > 0) {
                action.path.push(plugin.externMethods[0]);

                if (action.type === "action") {
                    action.operator = Operator.Execute;
                }
            }

        }

    }

    return action;




}