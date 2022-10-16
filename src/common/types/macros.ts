import { Operator } from "./fields";

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
    Execute = "Execute",
}

export interface MacroActionConfigurationError {
    critical?: boolean;
    type: MacroActionConfigurationErrorType;
    message: string;
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

export type TargetType = ":app" | ":plugin" | ":function" | ":macro";
export type TargetedPath<T extends TargetType = TargetType> = [T, ...string[]];

export interface MacroAction<T extends TargetType = TargetType> {
    type: "action";
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: unknown;
    operator: Operator;
}

export interface MacroCondition<T extends TargetType = TargetType> {
    type: "condition";
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: unknown;
    comparator: ConditionComparator;
}

export type Actionable<T extends TargetType = TargetType> =
    | MacroAction<T>
    | MacroCondition<T>;

export interface MacroTriggerDTO {
    type: TriggerType;
    value?: unknown;
}

export interface MacroDTO {
    id: string;
    name: string;
    enabled: boolean;
    trigger: MacroTriggerDTO;
    actions: MacroAction[];
    actionSequence: MacroActionSequence;
    conditions: MacroCondition[];
    error?: string;
}

export interface MacrosDTO {
    revision: number;
    macros: MacroDTO[];
}

export enum TriggerType {
    None = "None",
    Hotkey = "Hotkey",
    WorldEvent = "WorldEvent",
    Mouse = "Mouse",
}
export interface MacroTrigger {
    type: TriggerType;
    serialize: () => unknown;
    weight: number;
}
