import { Logger } from "common/logging";
import {
    MacroAction,
    MacroActionConfigurationErrorType,
    MacroCondition,
    ConditionComparator,
    MacrosDTO,
    TargetedPath,
    Settings,
    PluginMetaData,
    MacroDTO,
} from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { FieldDefinition, Operator } from "../types/fields";
import {
    getAppFieldDefinition,
    getTypeOfField,
    getPluginFieldDefinition,
    getAvailableOperationsForTypeOfField,
    getAvailableComparatorsForTypeOfField,
} from "./field-utilities";

export const sanitizeMacros = (
    macros: MacrosDTO,
    settings: Settings,
    plugins: PluginMetaData[],
    logger?: Logger
) => {
    for ( const macro of macros.macros ) {
        delete macro.error;

        for ( const action of macro.actions ) {
            try {
                delete action.error;

                patchMutationInstruction( action, settings, plugins );

                if ( action.group === undefined ) {
                    action.group =
                        Math.max( ...macro.actions.map( ( a ) => a.group ?? 0 ), 0 ) + 1;
                }

                sanitizeActionable( action, settings, macros.macros, plugins );
            } catch ( e ) {
                logger &&
                    logger.error(
                        withErrorMessage(
                            e,
                            `Error while sanitizing macro action ${action.id}`
                        )
                    );

                action.error = {
                    type: MacroActionConfigurationErrorType.InvalidAction,
                    message: "Program error",
                };
            }
        }

        for ( const condition of macro.conditions ) {
            try {
                delete condition.error;

                patchConditionComparator( condition, settings, plugins );

                sanitizeActionable( condition, settings, macros.macros, plugins );
            } catch ( e ) {
                logger &&
                    logger.error(
                        withErrorMessage(
                            e,
                            `Error while sanitizing macro action ${condition.id}`
                        )
                    );

                condition.error = {
                    type: MacroActionConfigurationErrorType.InvalidCondition,
                    message: "Program error",
                };
            }
        }
    }
    return macros;
};

const shouldHaveValue = ( action: MacroAction | MacroCondition ) => {
    if ( action.type === "action" && action.operator === Operator.Set ) {
        return true;
    } else if ( action.type === "condition" ) {
        return true;
    }

    return false;
};

const optionExists = ( options: Required<FieldDefinition>["options"], value: string ) => {
    return ( Array.isArray( options ) ? options : Object.values( options ) ).find(
        ( option ) => option === value
    );
};

const patchValue = ( action: MacroAction | MacroCondition, field: FieldDefinition ) => {
    if (
        action.value === undefined ||
        ( field.options && !optionExists( field.options, action.value as string ) )
    ) {
        action.value = field.value;
    }
};

const patchMutationInstruction = (
    action: MacroAction,
    settings: Settings,
    plugins: PluginMetaData[]
) => {
    const validInstructions = getAvailableOperationsForAction( action, settings, plugins );

    if ( !validInstructions.includes( action.operator ) ) {
        action.operator = validInstructions[0];
    }
};

const patchConditionComparator = (
    condition: MacroCondition,
    settings: Settings,
    plugins: PluginMetaData[]
) => {
    const validComparators = getMacroConditionValidComparators( condition, settings, plugins );

    if ( !validComparators.includes( condition.comparator ) ) {
        condition.comparator = validComparators[0];
    }
};

export const getAvailableOperationsForAction = (
    action: MacroAction,
    settings: Settings,
    plugins: PluginMetaData[]
): Operator[] => {
    if ( action.path[0] === ":function" ) {
        return [ Operator.Execute ];
    } else if ( action.path[0] === ":macro" ) {
        if ( action.path[2] === "enabled" ) {
            return getAvailableOperationsForTypeOfField( "boolean" );
        } else if ( action.path[2] === "program" ) {
            return [ Operator.Execute, Operator.SetToDefault ];
        }
        return [];
    } else {
        const typeOfField = getTypeOfField(
            action.path[0] === ":app"
                ? getAppFieldDefinition( settings, plugins, action.path as TargetedPath<":app"> )
                : getPluginFieldDefinition(
                      plugins,
                      action.path as TargetedPath<":plugin">
                  )
        );

        if ( typeOfField === null ) {
            return [];
        }

        return getAvailableOperationsForTypeOfField( typeOfField );
    }
};

export const getMacroConditionValidComparators = (
    condition: MacroCondition,
    settings: Settings,
    plugins: PluginMetaData[]
): ConditionComparator[] => {
    if ( condition.path[0] === ":function" ) {
        return getAvailableComparatorsForTypeOfField( "number" );
    } else if ( condition.path[0] === ":macro" ) {
        return getAvailableComparatorsForTypeOfField( "boolean" );
    } else {
        const typeOfField = getTypeOfField(
            condition.path[0] === ":app"
                ? getAppFieldDefinition(
                      settings,
                      plugins,
                      condition.path as TargetedPath<":app">
                  )
                : getPluginFieldDefinition(
                      plugins,
                      condition.path as TargetedPath<":plugin">
                  )
        );

        if ( typeOfField === null ) {
            return [];
        }

        return getAvailableComparatorsForTypeOfField( typeOfField );
    }
};

export function sanitizeActionable<T extends MacroAction | MacroCondition>(
    action: T,
    settings: Settings,
    macros: MacroDTO[],
    plugins: PluginMetaData[]
) {
    if ( action.path.length === 0 ) {
        action.path = [ ":app" ];
    }

    if ( action.path[0] === ":app" ) {
        let field = getAppFieldDefinition(
            settings,
            plugins,
            action.path as TargetedPath<":app">
        );

        if ( !field ) {
            action.path = [ ":app", "audio", "music" ];

            field = getAppFieldDefinition(
                settings,
                plugins,
                action.path as TargetedPath<":app">
            )!;
        }

        if ( shouldHaveValue( action ) ) {
            patchValue( action, field );
        }
    } else if ( action.path[0] === ":plugin" ) {
        const [ , pluginName ] = action.path;

        const plugin =
            plugins.find( ( p ) => p.name === pluginName ) ??
            plugins[0];

        if ( !plugin ) {
            action.error = {
                type: MacroActionConfigurationErrorType.MissingPlugin,
                message: `Missing plugin ${pluginName}`,
            };

            return action;
        }

        const field = getPluginFieldDefinition(
            plugins,
            action.path as TargetedPath<":plugin">
        );

        const fieldName =
            ( action.path[2] && action.path[2].startsWith( "externMethod" ) ) || field
                ? action.path[2]
                : Object.keys( plugin.config ?? {} ).find( ( k ) => k !== "system" );

        action.path = [ ":plugin", plugin.name ];

        if ( fieldName ) {
            action.path.push( fieldName );
        }
        if ( shouldHaveValue( action ) ) {
            const field = plugin.config?.[action.path[2] as keyof typeof plugin] ?? {
                value: null,
            };

            patchValue( action, field );
        }
    } else if ( action.path[0] === ":function" ) {
        if ( action.type === "action" ) {
            action.operator = Operator.Execute;
        } else {
            //TODO: wtf

            action.comparator = ConditionComparator.Execute;
        }

        if ( typeof action.value !== "string" ) {
            action.value = "";
        }
    } else if ( action.path[0] === ":macro" ) {
        if ( action.path.length > 1 ) {
            if ( !macros.find( ( m ) => m.id === action.path[1] ) ) {
                action.error = {
                    type: MacroActionConfigurationErrorType.InvalidMacro,
                    message: "The macro originally targeted does not exist",
                };

                action.path.slice( 0, 1 );
            }
        }

        if ( action.path.length === 1 ) {
            if ( macros[0] ) {
                action.path.push( macros[0].id );
            }
        }

        if ( action.path.length === 2 ) {
            action.path.push( "enabled" );
        }

        if ( typeof action.value !== "boolean" ) {
            action.value = true;
        }
    }

    return action;
}
