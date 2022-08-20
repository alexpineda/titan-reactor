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

export type MacroActionBase = {
    id: string;
    type: MacroActionType;
    effect: MacroActionEffect;
    error?: MacroActionConfigurationError;
    resetValue?: any;
}

export type MacroActionHostModifyValue = MacroActionBase & {
    type: MacroActionType.ModifyAppSettings;
    field: string[];
    value?: any;
}

export type MacroActionGameTimeApiCallMethod = MacroActionBase & {
    type: MacroActionType.CallGameTimeApi;
    value: string;
}

export type MacroActionPluginModifyValue = MacroActionBase & {
    type: MacroActionType.ModifyPluginSettings;
    pluginName: string;
    field: string[];
    value?: any;
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