import groupBy from "lodash.groupby";
import keyboardShortcut from "./keyboard-shortcut";
import directory from "./directory";
import { AppConfiguration, FieldDefinition } from "common/types";
import { CustomInput, OnChangeHandler } from "leva/plugin";
import { capitalizeFirstLetters } from "../../utils/string-utils";

type LevaPluginWrapper =
    | ( ( input: ControllableDefinition ) => CustomInput<ControllableDefinition> )
    | ( ( input: ControllableDefinition ) => ControllableDefinition );

export interface ControllableDefinition extends FieldDefinition {
    onChange: OnChangeHandler;
    folder: string;
}

type KeyedControllableDefinition = ReturnType<LevaPluginWrapper> & {
    _key: string;
    _originalKey: string;
};

export function wrapFieldConfigWithChangeListener(
    fieldConfig: FieldDefinition,
    onChange: ( value: unknown, key?: string ) => void,
    key?: string,
    overwriteOnChange = true
) {
    let wrapper: LevaPluginWrapper = ( input: ControllableDefinition ) => input;

    if ( fieldConfig.type === "keyboard-shortcut" ) {
        wrapper = keyboardShortcut as unknown as LevaPluginWrapper;
    } else if ( fieldConfig.type === "directory" ) {
        wrapper = directory as unknown as LevaPluginWrapper;
    }

    return wrapper( {
        ...fieldConfig,
        folder: fieldConfig.folder ?? "Configuration",
        onChange:
            !overwriteOnChange && fieldConfig.onChange
                ? fieldConfig.onChange
                : ( value: unknown, _: unknown, input: { initial: boolean } ) => {
                      if ( fieldConfig.value !== value && !input.initial ) {
                          fieldConfig.value = value;
                          onChange( value, key );
                      }
                  },
    } );
}

interface AttachParams {
    config?: Record<string, FieldDefinition | AppConfiguration>;
    onChange: ( value: any, key?: string ) => void;
    overwriteOnChange?: boolean;
    groupByFolder?: boolean;
    includeHidden?: boolean;
}
const defaultOptions: Partial<AttachParams> = {
    overwriteOnChange: true,
    groupByFolder: true,
    includeHidden: false,
};

const isAppConfiguration = ( config: any ): config is AppConfiguration =>
    typeof config === "object" && "hidden" in config;

export const attachOnChangeAndGroupByFolder = ( userOptions: AttachParams ) => {
    const { config, onChange, overwriteOnChange, includeHidden } = {
        ...defaultOptions,
        ...userOptions,
    };
    if ( config === undefined ) {
        return [];
    }
    const values = [];
    for ( const k in config ) {
        const field = config[k];
        if ( k !== "system" && typeof field === "object" && "value" in field ) {
            if ( isAppConfiguration( field ) && field.hidden && !includeHidden ) {
                continue;
            }
            const obj = wrapFieldConfigWithChangeListener(
                field,
                onChange,
                k,
                overwriteOnChange
            ) as KeyedControllableDefinition;

            obj._originalKey = k;
            obj._key = capitalizeFirstLetters( k );

            values.push( obj );
        }
    }

    return values;
};

export const groupConfigByFolder = (
    values: ReturnType<typeof attachOnChangeAndGroupByFolder>
) => {
    const grouped = groupBy( values, "folder" );
    return Object.keys( grouped ).map( ( folder ) => [
        folder,
        grouped[folder].reduce( ( acc, v ) => ( { ...acc, [v._key]: v } ), {} ),
    ] ) as [string, Record<string, KeyedControllableDefinition>][];
};

export const groupConfigByKey = (
    values: ReturnType<typeof attachOnChangeAndGroupByFolder>
) => {
    const reduced = values.reduce<Record<string, KeyedControllableDefinition>>(
        ( acc, v ) => ( { ...acc, [v._key]: v } ),
        {}
    );
    return reduced;
};
