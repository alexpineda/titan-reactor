import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { MacroAction, MacroActionType, MutationInstruction } from "common/types";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";

export const getMacroActionValidModifyEffects = (valueType: "boolean" | "number" | "string") => {
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


export const getValidMutationInstructions = (
    action: MacroAction,
    settings: SettingsAndPluginsMeta
): MutationInstruction[] => {

    if (action.type === MacroActionType.ModifyAppSettings) {
        const field = getAppSettingsPropertyInLevaFormat(settings.data, settings.enabledPlugins, action.path);
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
        return [];
    } else if (action.type === MacroActionType.ModifyPluginSettings) {
        const plugin = settings.enabledPlugins.find((p) => p.name === action.path[0]);
        if (!plugin) {
            return [];
        }

        const field = plugin.config?.[action.path[1] as keyof typeof plugin];
        if (field === undefined) {
            return [];
        }
        const typeOfField = typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return [...getMacroActionValidModifyEffects(typeOfField)];
    }
    return [];
};
