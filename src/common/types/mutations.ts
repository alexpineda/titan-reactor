export enum Operator {
    SetToDefault = "SetToDefault",
    Set = "Set",
    Toggle = "Toggle",
    Increase = "Increase",
    Decrease = "Decrease",
    IncreaseCycle = "IncreaseCycle",
    DecreaseCycle = "DecreaseCycle",
    Min = "Min",
    Max = "Max",
    Execute = "Execute",
}

export type FieldDefinition = {
    label?: string;
    value: any;//number | string | boolean | number[];
    step?: number;
    min?: number;
    max?: number;
    options?: string[] | Record<string, string>;
}

export type Operation = {
    operator: Operator;
    path: string[];
    value?: any;
}