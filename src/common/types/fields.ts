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

export interface FieldDefinition<T = unknown> {
    /**
     * The type is usually inferred except for the case of Leva Plugins.
     */
    type?: string;

    onChange?: ( value: any, path: string, context: any ) => void;
    folder?: string;
    label?: string;
    value: T; //number | string | boolean | number[];
    step?: number;
    min?: number;
    max?: number;
    options?: string[] | Record<string, string>;
}

export interface AppConfiguration<T = unknown> extends FieldDefinition<T> {
    hidden?: boolean;
    conditionOnly?: boolean;
}
export interface Operation {
    operator: Operator;
    path: string[];
    value?: any;
}
