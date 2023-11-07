import { Operator, FieldDefinition } from "common/types";
import { log } from "@ipc/log";
import { getTypeOfField, TypeOfField } from "common/macros/field-utilities";

export const fieldOperation = (
    instruction: Operator,
    field: FieldDefinition,
    newValue: unknown,
    defaultValue: unknown
): unknown => {
    const typeOfField = getTypeOfField( field );

    if ( instruction === Operator.SetToDefault && typeof defaultValue === "undefined" ) {
        log.error( "Cannot set value to default because default value is undefined" );
        return field.value;
    }

    if ( typeOfField === null ) {
        log.warn( "field.type is not a valid type" );
        return field.value;
    }

    if ( field.options ) {
        return applyOperatorToList(
            instruction,
            field as FieldDefinition<string>,
            newValue as string,
            defaultValue as string | undefined
        );
    } else if ( typeOfField === "boolean" || instruction === Operator.Toggle ) {
        return applyOperatorToBoolean(
            instruction,
            field as FieldDefinition<boolean>,
            newValue as boolean | undefined,
            defaultValue as boolean | undefined
        );
    } else if ( typeOfField === "number" ) {
        return applyOperatorToNumber(
            instruction,
            field as FieldDefinition<number>,
            newValue as number | undefined,
            defaultValue as number | undefined
        );
    }
    return applyOperatorToAny( instruction, field, newValue, defaultValue, typeOfField );
};

const applyOperatorToAny = (
    instruction: Operator,
    field: FieldDefinition,
    newValue: any,
    defaultValue: any,
    expectedType: TypeOfField
): unknown => {
    if ( instruction === Operator.Set ) {
        if ( getTypeOfField( field ) !== expectedType ) {
            log.warn( `field.value is not a ${expectedType}` );
            return field.value;
        }

        return newValue;
    } else if ( instruction === Operator.SetToDefault ) {
        return defaultValue;
    }

    return field.value;
};

const applyOperatorToBoolean = (
    instruction: Operator,
    field: FieldDefinition<boolean>,
    newValue: boolean | undefined,
    defaultValue: boolean | undefined
) => {
    if ( instruction === Operator.Toggle ) {
        return !field.value;
    }

    return applyOperatorToAny(
        instruction,
        field as FieldDefinition,
        newValue,
        defaultValue,
        "boolean"
    );
};

const applyOperatorToNumber = (
    instruction: Operator,
    field: FieldDefinition<number>,
    newValue: number | undefined,
    defaultValue: number | undefined
) => {
    const max =
        field.max === undefined || !Number.isFinite( field.max )
            ? Number.MAX_SAFE_INTEGER
            : field.max;

    const min =
        field.min === undefined || !Number.isFinite( field.min )
            ? Number.MIN_SAFE_INTEGER
            : field.min;

    if ( max < min ) {
        log.warn( "field.max is less than field.min" );
        return field.value;
    }

    if ( instruction === Operator.Increase && Number.isFinite( field.step ) ) {
        return Math.min( field.value + field.step!, max );
    } else if ( instruction === Operator.Decrease && Number.isFinite( field.step ) ) {
        return Math.max( field.value - field.step!, min );
    } else if ( instruction === Operator.IncreaseCycle && Number.isFinite( field.step ) ) {
        const nv = field.value + field.step!;
        return nv > max ? min : nv;
    } else if ( instruction === Operator.DecreaseCycle && Number.isFinite( field.step ) ) {
        const nv = field.value - field.step!;
        return nv < min ? max : nv;
    } else if ( instruction === Operator.Set && newValue !== undefined ) {
        if ( newValue > max ) {
            return field.max;
        } else if ( newValue < min ) {
            return field.min;
        }

        return newValue;
    } else if ( instruction === Operator.Max && Number.isFinite( field.max ) ) {
        return field.max;
    } else if ( instruction === Operator.Min && Number.isFinite( field.min ) ) {
        return field.min;
    } else if ( instruction === Operator.SetToDefault ) {
        return defaultValue;
    }

    log.warn( "Macro action effect is invalid." );
    return field.value;
};

const applyOperatorToList = (
    instruction: Operator,
    field: FieldDefinition<string>,
    newValue: string,
    defaultValue: string | undefined
) => {
    const options = Array.isArray( field.options )
        ? field.options
        : Object.values( field.options! );

    const idx = options.indexOf( field.value );
    if ( idx === -1 ) {
        log.warn( `Invalid macro action, couldn't find option ${field.label!}` );
        return options[0];
    }

    if ( instruction === Operator.Increase ) {
        return options[Math.min( idx + 1, options.length - 1 )];
    } else if ( instruction === Operator.Decrease ) {
        return options[Math.max( idx - 1, 0 )];
    } else if ( instruction === Operator.IncreaseCycle ) {
        return options[( idx + 1 ) % options.length];
    } else if ( instruction === Operator.DecreaseCycle ) {
        let ndx = idx - 1;
        ndx = ndx < 0 ? options.length - 1 : ndx;
        return options[ndx];
    } else if ( instruction === Operator.Set && options.includes( newValue ) ) {
        return newValue;
    } else if ( instruction === Operator.Max ) {
        return options[options.length - 1];
    } else if ( instruction === Operator.Min ) {
        return options[0];
    } else if (
        instruction === Operator.SetToDefault &&
        options.includes( defaultValue! )
    ) {
        return defaultValue;
    }

    log.warn( `Invalid macro action options effect ${instruction}` );
    return field.value;
};
