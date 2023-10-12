import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import {
    FieldDefinition,
    ConditionComparator,
    Operator,
    SettingsMeta,
    TargetedPath,
} from "common/types";

export type SettingsAndPluginsMeta = Pick<SettingsMeta, "data" | "activatedPlugins">;

export const getAvailableOperationsForTypeOfField = ( valueType: TypeOfField ) => {
    if ( valueType === "boolean" ) {
        return [Operator.SetToDefault, Operator.Set, Operator.Toggle];
    } else if ( valueType === "number" ) {
        return [
            Operator.SetToDefault,
            Operator.Set,
            Operator.Increase,
            Operator.IncreaseCycle,
            Operator.Decrease,
            Operator.DecreaseCycle,
            Operator.Min,
            Operator.Max,
        ];
    } else if ( valueType === "string" || valueType === "vector" ) {
        return [Operator.SetToDefault, Operator.Set];
    }
    return [];
};

export const getAvailableComparatorsForTypeOfField = ( valueType: TypeOfField ) => {
    if ( valueType === "boolean" || valueType === "string" || valueType === "vector" ) {
        return [ConditionComparator.Equals, ConditionComparator.NotEquals];
    } else if ( valueType === "number" ) {
        return [
            ConditionComparator.Equals,
            ConditionComparator.NotEquals,
            ConditionComparator.GreaterThan,
            ConditionComparator.GreaterThanOrEquals,
            ConditionComparator.LessThan,
            ConditionComparator.LessThanOrEquals,
        ];
    }
    return [];
};

export const getAppFieldDefinition = (
    settings: SettingsAndPluginsMeta,
    path: TargetedPath<":app">
) => {
    const field = getAppSettingsPropertyInLevaFormat(
        settings.data,
        settings.activatedPlugins,
        path.slice( 1 )
    );

    if ( !field ) {
        return null;
    }

    return field;
};

export const getPluginFieldDefinition = (
    settings: SettingsAndPluginsMeta,
    path: TargetedPath<":plugin">
) => {
    const plugin = settings.activatedPlugins.find( ( p ) => p.name === path[1] );

    if ( plugin === undefined ) {
        return null;
    }

    const field = plugin.config?.[path[2] as keyof typeof plugin] as
        | FieldDefinition
        | undefined;

    if ( field === undefined ) {
        return null;
    }

    return field;
};

export const isValidTypeOfField = ( type: string ): type is TypeOfField => {
    return (
        type === "boolean" ||
        type === "number" ||
        type === "string" ||
        type === "vector"
    );
};

export type TypeOfField = "boolean" | "number" | "string" | "vector";

export const getTypeOfField = ( field?: FieldDefinition | null ): TypeOfField | null => {
    if ( !field ) {
        return null;
    }

    let typeOfField = typeof field.value as string;

    if ( field.options ) {
        typeOfField = "number";
    } else if (
        Array.isArray( field.value ) &&
        field.value.every( ( v ) => typeof v === "number" )
    ) {
        typeOfField = "vector";
    }

    if ( !isValidTypeOfField( typeOfField ) ) {
        return null;
    }
    return typeOfField;
};

export const getFieldDefinitionDisplayValue = (
    options: FieldDefinition["options"],
    value: unknown
): any => {
    if ( getTypeOfField( { value, options } ) === "vector" ) {
        return ( value as number[] ).map( ( v ) => v.toFixed( 2 ) ).join( ", " );
    }

    const displayValue =
        options && !Array.isArray( options )
            ? Object.entries( options ).find( ( [_, v] ) => v === value )?.[0] ?? value
            : value;

    return displayValue;
};
