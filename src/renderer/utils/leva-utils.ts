import groupBy from "lodash.groupby";
import keyboardShortcut from "../command-center/leva-plugins/keyboard-shortcut";
import directory from "../command-center/leva-plugins/directory";
import { FieldDefinition } from "common/types";

export const wrapFieldConfigWithChangeListener = (
    fieldConfig: FieldDefinition,
    onChange: ( value: unknown, key?: string ) => void,
    key?: string,
    overwriteOnChange = true
) => {
    let wrapper = ( input: unknown ) => input;
    if ( fieldConfig.type === "keyboard-shortcut" ) {
        wrapper = keyboardShortcut;
    } else if ( fieldConfig.type === "directory" ) {
        wrapper = directory;
    }

    return wrapper( {
        ...fieldConfig,
        onChange:
            !overwriteOnChange && fieldConfig.onChange
                ? fieldConfig.onChange
                : ( value: unknown, _: any, input: { initial: boolean } ) => {
                      if ( fieldConfig.value !== value && !input.initial ) {
                          fieldConfig.value = value;
                          onChange( value, key );
                      }
                  },
    } );
};

interface AttachParams {
    config: unknown;
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

export const attachOnChangeAndGroupByFolder = ( userOptions: AttachParams ) => {
    const { config, onChange, overwriteOnChange, groupByFolder, includeHidden } = {
        ...defaultOptions,
        ...userOptions,
    };
    const values = [];
    for ( const k in config || {} ) {
        if ( k !== "system" && typeof config[k] === "object" && "value" in config[k] ) {
            if ( config[k].hidden && !includeHidden ) {
                continue;
            }
            const obj = wrapFieldConfigWithChangeListener(
                config[k],
                onChange,
                k,
                overwriteOnChange
            );

            obj.folder = config[k].folder || "Configuration";
            obj._key = k;
            values.push( obj );
        }
    }
    if ( groupByFolder ) {
        const grouped = groupBy( values, "folder" );
        return Object.keys( grouped ).map( ( folder ) => [
            folder,
            grouped[folder].reduce( ( acc, v ) => ( { ...acc, [v._key]: v } ), {} ),
        ] );
    } else {
        return values.reduce( ( acc, v ) => ( { ...acc, [v._key]: v } ), {} );
    }
};

export const simplifyLevaConfig = ( config: Record<string, any> ) => {
    const values: Record<string, any> = {};
    for ( const k in config ) {
        if ( k !== "system" && typeof config[k] === "object" && "value" in config[k] ) {
            values[k] = config[k].value;
        }
    }
    return values;
};
