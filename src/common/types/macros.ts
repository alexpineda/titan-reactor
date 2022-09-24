import { FieldTarget, Mutation } from "./mutations";

export enum MacroActionSequence {
    AllSync = "AllSync",
    SingleAlternate = "SingleAlternate",
    SingleRandom = "SingleRandom",
}

export enum MacroActionType {
    ModifyAppSettings = "ModifyAppSettings",
    ModifyPluginSettings = "ModifyPluginSettings",
    CallGameTimeApi = "CallGameTimeApi",
}

export enum MacroConditionType {
    AppSettingsCondition = "AppSettingsCondition",
    PluginSettingsCondition = "PluginSettingsCondition",
    FunctionCondition = "FunctionCondition",
}

export enum ConditionComparator {
    Equals = "Equals",
    NotEquals = "NotEquals",
    GreaterThan = "GreaterThan",
    LessThan = "LessThan",
    GreaterThanOrEquals = "GreaterThanOrEquals",
    LessThanOrEquals = "LessThanOrEquals",
}

export type MacroConditionAppSetting = FieldTarget & {
    type: MacroConditionType.AppSettingsCondition,
    id: string;
    comparator: ConditionComparator;
    error?: MacroActionConfigurationError;
}

export type MacroConditionPluginSetting = FieldTarget & {
    type: MacroConditionType.PluginSettingsCondition,
    id: string;
    comparator: ConditionComparator;
    error?: MacroActionConfigurationError;
}

export type MacroConditionFunction = {
    type: MacroConditionType.FunctionCondition,
    id: string;
    value?: string;
    comparator: ConditionComparator;
    error?: MacroActionConfigurationError;
}

export type MacroCondition = MacroConditionAppSetting | MacroConditionPluginSetting | MacroConditionFunction;


export type MacroActionConfigurationError = {
    type: MacroActionConfigurationErrorType,
    message: string,
}

export enum MacroActionConfigurationErrorType {
    MissingField = "MissingField",
    InvalidField = "InvalidField",
    InvalidFieldValue = "InvalidFieldValue",
    InvalidInstruction = "InvalidInstruction",
    InvalidCondition = "InvalidCondition",
    MissingPlugin = "MissingPlugin",
    InvalidPlugin = "InvalidPlugin",
    InvalidMacro = "InvalidMacro",
    InvalidAction = "InvalidAction",
}

export type MacroActionHostModifyValue = Mutation & {
    type: MacroActionType.ModifyAppSettings;
    id: string;
    error?: MacroActionConfigurationError;
}

export type MacroActionGameTimeApiCallMethod = {
    type: MacroActionType.CallGameTimeApi;
    value: string;
    id: string;
    error?: MacroActionConfigurationError;
}

export type MacroActionPluginModifyValue = Mutation & {
    type: MacroActionType.ModifyPluginSettings;
    id: string;
    error?: MacroActionConfigurationError;
}

export type MacroAction = (MacroActionHostModifyValue | MacroActionGameTimeApiCallMethod | MacroActionPluginModifyValue);

export type MacroTriggerDTO = {
    type: TriggerType;
    value?: any;
}

export type MacroDTO = {
    id: string;
    name: string;
    enabled: boolean;
    trigger: MacroTriggerDTO;
    actions: MacroAction[];
    actionSequence: MacroActionSequence;
    conditions: MacroCondition[];
    error?: string;
};

export type MacrosDTO = {
    revision: number;
    macros: MacroDTO[];
};


export enum TriggerType {
    Manual = "Manual",
    Hotkey = "Hotkey",
    GameHook = "GameHook",
    Mouse = "Mouse",
}
export interface MacroTrigger {
    type: TriggerType;
    serialize: () => any;
    weight: number;
}