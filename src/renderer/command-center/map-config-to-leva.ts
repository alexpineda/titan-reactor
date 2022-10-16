import groupBy from "lodash.groupby";
import keyboardShortcut from "./leva-plugins/keyboard-shortcut";
import directory from "./leva-plugins/directory";

export const mapSingleConfigToLeva = (
    fieldConfig: any,
    onChange: ( value: any ) => void
) => {
    let wrapper = ( input: any ) => input;
    if ( fieldConfig.type === "keyboard-shortcut" ) {
        wrapper = keyboardShortcut;
    } else if ( fieldConfig.type === "directory" ) {
        wrapper = directory;
    }

    return wrapper( {
        ...fieldConfig,
        onChange: ( value: any, _: any, input: { initial: boolean } ) => {
            if ( fieldConfig.value !== value && !input.initial ) {
                fieldConfig.value = value;
                onChange( value );
            }
        },
    } );
};

export const mapConfigToLeva = ( config: any, onChange: ( value: any ) => void ) => {
    const values = [];
    for ( const k in config || {} ) {
        if ( k !== "system" && typeof config[k] === "object" && "value" in config[k] ) {
            const obj = mapSingleConfigToLeva( config[k], onChange );

            obj.folder = config[k].folder || "Configuration";
            obj._key = k;
            values.push( obj );
        }
    }
    const grouped = groupBy( values, "folder" );
    return Object.keys( grouped ).map( ( folder ) => [
        folder,
        grouped[folder].reduce( ( acc, v ) => ( { ...acc, [v._key]: v } ), {} ),
    ] );
};
