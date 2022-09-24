import { Operator } from "./mutations";

export enum MacroActionSequence {
    AllSync = "AllSync",
    SingleAlternate = "SingleAlternate",
    SingleRandom = "SingleRandom",
}

export enum ConditionComparator {
    Equals = "Equals",
    NotEquals = "NotEquals",
    GreaterThan = "GreaterThan",
    LessThan = "LessThan",
    GreaterThanOrEquals = "GreaterThanOrEquals",
    LessThanOrEquals = "LessThanOrEquals",
}


export type MacroActionConfigurationError = {
    critical?: boolean;
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

export type TargetType = ":app" | `:plugin` | ":function";
export type TargetedPath<T extends TargetType = TargetType> = [T, ...string[]];

export type MacroAction<T extends TargetType = TargetType> = {
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: any;
    operator: Operator;
}

export type MacroCondition<T extends TargetType = TargetType> = {
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: any;
    comparator: ConditionComparator;
}

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