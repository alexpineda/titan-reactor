import { describe, it, jest } from "@jest/globals";
import {
    MacroAction,
    MacroActionSequence,
    MacroDTO,
    Operator,
    TriggerType,
} from "common/types";
import type { SettingsAndPluginsMeta } from "./field-utilities";
import * as fieldUtilities from "./field-utilities";
import { sanitizeMacros, sanitizeActionable } from "./sanitize-macros";

jest.mock( "./field-utilities" );

const util = {
    createMacro( partial?: Partial<MacroDTO> ) {
        return {
            id: "1",
            name: "test",
            actions: [],
            conditions: [],
            actionSequence: MacroActionSequence.AllSync,
            enabled: true,
            trigger: {
                type: TriggerType.None,
            },
            ...partial,
        };
    },

    createAction( partial?: Partial<MacroAction> ): MacroAction {
        return {
            type: "action",
            id: "1",
            operator: Operator.SetToDefault,
            path: [":app"],
            ...partial,
        };
    },
};

describe( "sanitizeMacros", () => {
    it( "should clear macro errors", () => {
        const macro = util.createMacro( {
            error: "some error",
        } );

        expect( macro.error ).toBeDefined();

        sanitizeMacros(
            {
                macros: [macro],
                revision: 0,
            },
            {} as SettingsAndPluginsMeta
        );

        expect( macro.error ).toBeUndefined();
    } );
} );

describe( "sanitizeActionable", () => {
    describe( ":function", () => {
        it( "should set to empty string if undefined", () => {
            const action = util.createAction( {
                path: [":function"],
            } );

            sanitizeActionable( action, {} as SettingsAndPluginsMeta );

            expect( action.value ).toEqual( "" );
        } );
    } );

    describe( ":app", () => {
        it( "should set path if invalid field", () => {
            const action = util.createAction();

            sanitizeActionable( action, {} as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":app", "audio", "music"] );
        } );

        it( "should leave path if valid field", () => {
            //@ts-expect-error
            fieldUtilities.getAppFieldDefinition = jest.fn().mockReturnValue( true );

            const action = util.createAction( {
                path: [":app", "my", "path"],
            } );

            sanitizeActionable( action, {} as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":app", "my", "path"] );
        } );

        it( "should patch value of literal type if operator is Set", () => {
            //@ts-expect-error
            fieldUtilities.getAppFieldDefinition = jest.fn().mockReturnValue( {
                value: "foo",
            } );

            const action = util.createAction( {
                operator: Operator.SetToDefault,
            } );

            sanitizeActionable( action, {} as SettingsAndPluginsMeta );

            expect( action.value ).toEqual( undefined );

            const patched = util.createAction( {
                operator: Operator.Set,
            } );

            sanitizeActionable( patched, {} as SettingsAndPluginsMeta );

            expect( patched.value ).toEqual( "foo" );
        } );

        it( "should patch value if outdated option", () => {
            //@ts-expect-error
            fieldUtilities.getAppFieldDefinition = jest.fn().mockReturnValue( {
                value: "foo",
                options: ["foo", "bar"],
            } );

            const patched = util.createAction( {
                operator: Operator.Set,
                value: "cray",
            } );

            sanitizeActionable( patched, {} as SettingsAndPluginsMeta );

            expect( patched.value ).toEqual( "foo" );
        } );
    } );

    describe( ":plugin", () => {
        it( "should error if no plugin found", () => {
            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.error ).toBeDefined();
        } );

        it( "should not set path if invalid or no config", () => {
            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin"] );
        } );

        it( "should set path to config if invalid", () => {
            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                        config: {
                            foo: "bar",
                        },
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin", "foo"] );
        } );

        it( "should set path to extern method if invalid or no config", () => {
            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: ["baz"],
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin", "baz"] );
            expect( action.operator ).toEqual( Operator.Execute );
        } );

        it( "should set path to action value if field definition exists", () => {
            //@ts-expect-error
            fieldUtilities.getPluginFieldDefinition = jest.fn().mockReturnValue( true );

            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin", "test-plugin", "foo"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin", "foo"] );
        } );

        it( "should set path to externMethod if it exists", () => {
            //@ts-expect-error
            fieldUtilities.getPluginFieldDefinition = jest.fn().mockReturnValue( false );

            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin", "test-plugin", "externMethodFoo"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: ["externMethodFoo"],
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin", "externMethodFoo"] );
        } );

        it( "should strip externMethod if it does not exists", () => {
            //@ts-expect-error
            fieldUtilities.getPluginFieldDefinition = jest.fn().mockReturnValue( false );

            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin", "test-plugin", "externMethodFoo"],
            } );

            sanitizeActionable( action, {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                    },
                ],
            } as unknown as SettingsAndPluginsMeta );

            expect( action.path ).toEqual( [":plugin", "test-plugin"] );
        } );

        it( "should patch value of literal type if operator is Set", () => {
            //@ts-expect-error
            fieldUtilities.getPluginFieldDefinition = jest.fn().mockReturnValue( true );

            const action = util.createAction( {
                operator: Operator.SetToDefault,
                path: [":plugin", "test-plugin", "foo"],
            } );

            const settings = {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                        config: {
                            foo: {
                                value: "bar",
                            },
                        },
                    },
                ],
            } as unknown as SettingsAndPluginsMeta;
            sanitizeActionable( action, settings );

            expect( action.value ).toEqual( undefined );

            const patched = util.createAction( {
                operator: Operator.Set,
                path: [":plugin", "test-plugin", "foo"],
            } );

            sanitizeActionable( patched, settings );

            expect( patched.value ).toEqual( "bar" );
        } );

        it( "should patch value if outdated option", () => {
            //@ts-expect-error
            fieldUtilities.getPluginFieldDefinition = jest.fn().mockReturnValue( true );

            const settings = {
                activatedPlugins: [
                    {
                        name: "test-plugin",
                        externMethods: [],
                        config: {
                            foo: {
                                value: "bar",
                                options: ["bar", "baz"],
                            },
                        },
                    },
                ],
            } as unknown as SettingsAndPluginsMeta;

            const patched = util.createAction( {
                operator: Operator.Set,
                path: [":plugin", "test-plugin", "foo"],
                value: "cray",
            } );

            sanitizeActionable( patched, settings );

            expect( patched.value ).toEqual( "bar" );
        } );
    } );
} );
