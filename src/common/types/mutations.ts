export enum MutationInstruction {
    SetToDefault = "SetToDefault",
    Set = "Set",
    Toggle = "Toggle",
    Increase = "Increase",
    Decrease = "Decrease",
    IncreaseCycle = "IncreaseCycle",
    DecreaseCycle = "DecreaseCycle",
    Min = "Min",
    Max = "Max",
}

export type FieldDefinition = {
    value: any;
    step?: number;
    min?: number;
    max?: number;
    options?: any[] | {};
}

export type FieldTarget = {
    path: string[];
    value?: any;
}

export type Mutation = FieldTarget & {
    instruction: MutationInstruction;
}