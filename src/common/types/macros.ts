export enum MacroActionSequence {
    AllSync = "AllSync",
    SingleAlternate = "SingleAlternate",
    SingleRandom = "SingleRandom",
}

export enum MacroActionEffect {
    SetToDefault = "SetToDefault",
    Set = "Set",
    Toggle = "Toggle",
    Increase = "Increase",
    Decrease = "Decrease",
    IncreaseCycle = "IncreaseCycle",
    DecreaseCycle = "DecreaseCycle",
    Min = "Min",
    Max = "Max",
    CallMethod = "CallMethod",
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

export enum MacroConditionComparator {
    Equals = "Equals",
    NotEquals = "NotEquals",
    GreaterThan = "GreaterThan",
    LessThan = "LessThan",
    GreaterThanOrEquals = "GreaterThanOrEquals",
    LessThanOrEquals = "LessThanOrEquals",
}

export type MacroConditionAppSetting = {
    type: MacroConditionType.AppSettingsCondition,
    id: string;
    field: string[];
    value?: any;

    comparator: MacroConditionComparator;
    error?: MacroActionConfigurationError;
}

export type MacroConditionPluginSetting = {
    type: MacroConditionType.PluginSettingsCondition,
    id: string;
    pluginName: string;
    field: string[];
    value?: any;

    comparator: MacroConditionComparator;
    error?: MacroActionConfigurationError;
}

export type MacroConditionFunction = {
    type: MacroConditionType.FunctionCondition,
    id: string;
    value?: string;
    comparator: MacroConditionComparator;
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
    MissingPlugin = "MissingPlugin",
    InvalidPlugin = "InvalidPlugin",
    InvalidMacro = "InvalidMacro",
}

export type MacroActionHostModifyValue = {
    type: MacroActionType.ModifyAppSettings;
    field: string[];
    value?: any;

    id: string;
    effect: MacroActionEffect;
    error?: MacroActionConfigurationError;
    resetValue?: any;
}

export type MacroActionGameTimeApiCallMethod = {
    type: MacroActionType.CallGameTimeApi;
    value: string;

    id: string;
    effect: MacroActionEffect;
    error?: MacroActionConfigurationError;
}

export type MacroActionPluginModifyValue = {
    type: MacroActionType.ModifyPluginSettings;
    pluginName: string;
    field: string[];
    value?: any;

    id: string;
    effect: MacroActionEffect;
    error?: MacroActionConfigurationError;
    resetValue?: any;
}

export type MacroActionPlugin = MacroActionPluginModifyValue;
export type MacroAction = (MacroActionHostModifyValue | MacroActionGameTimeApiCallMethod | MacroActionPlugin);

export type MacroTriggerDTO = {
    type: TriggerType;
    value?: string;
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
}
export interface MacroTrigger {
    type: TriggerType;
    serialize: () => MacroTriggerDTO;
    weight: number;
}