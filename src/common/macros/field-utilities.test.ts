import {
    getAppFieldDefinition,
    getFieldDefinitionDisplayValue,
    getPluginFieldDefinition,
    getTypeOfField,
    SettingsAndPluginsMeta,
} from "./field-utilities";
import * as levaConfig from "common/get-app-settings-leva-config";

jest.mock( "common/get-app-settings-leva-config" );

describe( "getFieldDefinitionDisplayValue", () => {
    it( "should return the value if options is undefined", () => {
        const result = getFieldDefinitionDisplayValue( undefined, "baz" );

        expect( result ).toBe( "baz" );
    } );

    it( "should return the value if options is an array", () => {
        const result = getFieldDefinitionDisplayValue( ["foo", "bar"], "baz" );

        expect( result ).toBe( "baz" );
    } );

    it( "should return the key if options is an object and the value is found", () => {
        const result = getFieldDefinitionDisplayValue( { foo: "bar" }, "bar" );

        expect( result ).toBe( "foo" );
    } );
} );

describe( "getAppFieldDefinition", () => {
    it( "should return null if there is no field definition", () => {
        jest.spyOn( levaConfig, "getAppSettingsPropertyInLevaFormat" ).mockReturnValue(
            undefined
        );

        const result = getAppFieldDefinition( {} as SettingsAndPluginsMeta, [":app"] );

        expect( result ).toBe( null );
    } );

    it( "should return field if there is a field definition", () => {
        const testField = { value: "test" };

        jest.spyOn( levaConfig, "getAppSettingsPropertyInLevaFormat" ).mockReturnValue(
            testField
        );

        const result = getAppFieldDefinition( {} as SettingsAndPluginsMeta, [":app"] );

        expect( result ).toBe( testField );
    } );
} );

describe( "getPluginFieldDefinition", () => {
    it( "should return null if there is no plugin", () => {
        const result = getPluginFieldDefinition(
            {
                enabledPlugins: [
                    {
                        name: "foo",
                    },
                ],
            } as unknown as SettingsAndPluginsMeta,
            [":plugin", "bar"]
        );

        expect( result ).toBe( null );
    } );

    it( "should return null if there is no field definition", () => {
        const result = getPluginFieldDefinition(
            {
                enabledPlugins: [
                    {
                        name: "foo",
                    },
                ],
            } as unknown as SettingsAndPluginsMeta,
            [":plugin", "foo"]
        );

        expect( result ).toBe( null );
    } );

    it( "should return field if there is a field definition", () => {
        const testField = { value: "test" };

        const result = getPluginFieldDefinition(
            {
                enabledPlugins: [
                    {
                        name: "foo",
                        config: {
                            testField,
                        },
                    },
                ],
            } as unknown as SettingsAndPluginsMeta,
            [":plugin", "foo", "testField"]
        );

        expect( result ).toBe( testField );
    } );
} );

describe( "getTypeOfField", () => {
    it.each( [
        [null, null],
        [undefined, null],
        [Symbol( "test" ), null],
        [{}, null],
        ["string", "string"],
        [true, "boolean"],
        [77, "number"],
    ] )(
        "should return null if type of is not a number, boolean or string otherwise return type",
        ( value, expectedValue ) => {
            const field = {
                value,
            };

            expect( getTypeOfField( field ) ).toBe( expectedValue );
        }
    );

    it( "should treat a list as a number", () => {
        const field = {
            value: "test",
            options: [],
        };

        expect( getTypeOfField( field ) ).toBe( "number" );
    } );
} );
