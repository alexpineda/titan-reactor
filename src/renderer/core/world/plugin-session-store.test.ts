/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, jest } from "@jest/globals";
import { createPluginSessionStore } from "./plugin-session-store";
import * as settingsStore from "@stores/settings-store";
import { log } from "@ipc/log";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import { PluginMetaData } from "common/types";
import { PluginSystemUI } from "@plugins/plugin-system-ui";

jest.mock( "@ipc/log" );
jest.mock( "@core/global-events" );
jest.mock( "@stores/settings-store", () => ( {
    __esModule: true,
    settingsStore: null,
    useSettingsStore: {
        subscribe: jest.fn(),
    },
} ) );
jest.mock( "three-janitor" );

const initialState = {
    enabledPlugins: [],
};
const createBaseStore = () =>
    jest.fn( () => JSON.parse( JSON.stringify( initialState ) ) as unknown );

const uiPlugins = {
    sendMessage() {},
};

const createBasePlugin = ( _package?: Partial<PluginMetaData> ) => {
    const config = {
        foo: {
            value: "bar",
        },
    };

    const pluginPackage: Partial<PluginMetaData> = {
        id: "123",
        name: "test-plugin",
        version: "1.0.0",
        hooks: [],
        config,
        ..._package,
    };

    const plugins = new PluginSystemNative(
        [pluginPackage as unknown as PluginMetaData],
        () => {},
        () => {}
    );

    return {
        plugins,
        pluginPackage,
        expectedDefaultState: {
            "test-plugin": {
                foo: "bar",
            },
        },
    };
};

describe( "PluginSessionStore", () => {
    beforeEach( () => {
        //@ts-expect-error
        settingsStore.settingsStore = createBaseStore();
    } );

    it( "should not create any store data for plugins without configs", () => {
        const { plugins } = createBasePlugin( {
            config: undefined,
        } );

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        expect( session.getState() ).toStrictEqual( {} );
    } );

    it( "should not create any store data for plugins with invalid configs", () => {
        const { plugins } = createBasePlugin( {
            config: {
                //@ts-expect-error
                foo: "bar",
            },
        } );

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        expect( session.getState() ).toStrictEqual( {} );
    } );

    it( "should create store data for plugins with valid configs", () => {
        const { plugins } = createBasePlugin();

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        expect( session.getState() ).toStrictEqual( { "test-plugin": { foo: "bar" } } );

        expect( session.getValue( ["test-plugin", "foo"] ) ).toBe( "bar" );
    } );

    it( "should validate that plugin matches the name", () => {
        const { expectedDefaultState, plugins } = createBasePlugin();

        const session = createPluginSessionStore(
            plugins as unknown as PluginSystemNative,
            uiPlugins as unknown as PluginSystemUI
        );

        expect( session.getState() ).toStrictEqual( expectedDefaultState );

        session.setValue( ["bad-plugin", "foo"], "baz" );

        expect( session.getState() ).toStrictEqual( expectedDefaultState );

        expect( log.error ).toBeCalledTimes( 1 );
    } );

    it( "should validate that plugin is not active scene controller", () => {
        const { expectedDefaultState, plugins } = createBasePlugin();

        jest.spyOn( plugins, "isRegularPluginOrActiveSceneController" ).mockReturnValue(
            false
        );

        const session = createPluginSessionStore(
            plugins as unknown as PluginSystemNative,
            uiPlugins as unknown as PluginSystemUI
        );

        session.setValue( ["test-plugin", "foo"], "baz" );

        expect( session.getState() ).toStrictEqual( expectedDefaultState );
    } );

    it( "should validate that field definition exists", () => {
        const { expectedDefaultState, plugins, pluginPackage } = createBasePlugin();

        const plugin = plugins.getById( pluginPackage.id! )!;
        jest.spyOn( plugin, "getFieldDefinition" ).mockReturnValue( undefined );

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        expect( plugin.getFieldDefinition ).not.toHaveBeenCalled();

        session.setValue( [pluginPackage.name!, "foo"], "baz" );

        expect( session.getState() ).toStrictEqual( expectedDefaultState );

        expect( plugin.getFieldDefinition ).toBeCalledWith( "foo" );
    } );

    // should NOT call hooks if direct merge
    it( "should call hooks if value is set", () => {
        const { plugins, pluginPackage } = createBasePlugin();

        plugins.hook_onConfigChanged = jest.fn();
        uiPlugins.sendMessage = jest.fn();

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        session.setValue( ["test-plugin", "foo"], "baz" );

        expect( session.getState() ).toStrictEqual( { "test-plugin": { foo: "baz" } } );

        expect( plugins.hook_onConfigChanged ).toBeCalledTimes( 1 );

        expect( plugins.hook_onConfigChanged ).toBeCalledWith( pluginPackage.id, {
            foo: { value: "baz" },
        } );

        expect( uiPlugins.sendMessage ).toBeCalledTimes( 1 );
    } );

    it( "should not call hooks if merge is called directly", () => {
        const { plugins } = createBasePlugin();

        plugins.hook_onConfigChanged = jest.fn();
        uiPlugins.sendMessage = jest.fn();

        const session = createPluginSessionStore(
            plugins,
            uiPlugins as unknown as PluginSystemUI
        );

        session.merge( { "test-plugin": { foo: "baz" } } );

        expect( session.getState() ).toStrictEqual( { "test-plugin": { foo: "baz" } } );

        expect( plugins.hook_onConfigChanged ).not.toHaveBeenCalled();

        expect( uiPlugins.sendMessage ).not.toHaveBeenCalled();
    } );
} );
