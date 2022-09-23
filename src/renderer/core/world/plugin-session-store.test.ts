import { describe, it, jest } from "@jest/globals";
import { createPluginSessionStore } from "./plugin-session-store";
import * as settingsStore from "@stores/settings-store";
import { PluginBase } from "@plugins/plugin-base";
import { log } from "@ipc/log";

jest.mock("@ipc/log");
jest.mock("@core/global-events");
jest.mock("@stores/settings-store", () => ({
    __esModule: true,
    settingsStore: null,
    useSettingsStore: {
        subscribe: jest.fn()
    },
}));
jest.mock("three-janitor");

const initialState = {
    enabledPlugins: []
};
const createBaseStore = () => jest.fn(() => JSON.parse(JSON.stringify(initialState)));

class FakeNativePlugins {
    plugins: PluginBase[] = [];

    [Symbol.iterator]() {
        return this.plugins[Symbol.iterator]();
    }


    get reduce() {
        return this.plugins.reduce.bind(this.plugins);
    }

    getById(): PluginBase | undefined {
        return this.plugins[0];
    }

    getByName(): PluginBase | undefined {
        return this.plugins[0];
    }

    isRegularPluginOrActiveSceneController() {
        return true;
    }

    hook_onConfigChanged() {
    }
}

const uiPlugins = {
    sendMessage() {
    }
}

const createBasePlugin = () => {

    const config = {
        foo: {
            value: "bar"
        }
    };

    return {
        plugin: new PluginBase({
            id: "123",
            name: "test-plugin",
            version: "1.0.0",
            config
        }),
        expectedDefaultState: {
            "test-plugin": {
                foo: "bar"
            }
        }
    }
};


describe("ReactiveSessionVariables", () => {

    beforeEach(() => {
        //@ts-ignore
        settingsStore.settingsStore = createBaseStore();

    });

    it("should not create any store data for plugins without configs", () => {

        const nativePlugins = new FakeNativePlugins();

        nativePlugins.plugins = [
            new PluginBase({
                id: "123",
                name: "test-plugin",
                version: "1.0.0",
            })
        ]
        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        expect(session.getState()).toStrictEqual({});

    });

    it("should not create any store data for plugins with invalid configs", () => {

        const nativePlugins = new FakeNativePlugins();
        nativePlugins.plugins = [
            new PluginBase({
                id: "123",
                name: "test-plugin",
                version: "1.0.0",
                config: {
                    system: {},
                    foo: "bar"
                }
            })
        ]
        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        expect(session.getState()).toStrictEqual({});

    });

    it("should create store data for plugins with valid configs", () => {

        const nativePlugins = new FakeNativePlugins();

        nativePlugins.plugins = [
            createBasePlugin().plugin
        ]

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        expect(session.getState()).toStrictEqual({ "test-plugin": { foo: "bar" } });

        expect(session.getValue(["test-plugin", "foo"])).toBe("bar");

    });


    it("should ignore merge", () => {

        const nativePlugins = new FakeNativePlugins();

        const { plugin, expectedDefaultState } = createBasePlugin();
        nativePlugins.plugins = [
            plugin
        ]

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        session.merge({ [plugin.name]: { foo: "baz" } });

        expect(session.getState()).toStrictEqual(expectedDefaultState);

        expect(log.warn).toBeCalledTimes(1);

    });

    it("should validate that plugin matches the name", () => {

        const nativePlugins = new FakeNativePlugins();

        const { plugin, expectedDefaultState } = createBasePlugin();
        nativePlugins.plugins = [
            plugin
        ]
        nativePlugins.getByName = jest.fn(() => undefined);

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        expect(session.getState()).toStrictEqual(expectedDefaultState);

        session.setValue(["bad-plugin", "foo"], "baz");

        expect(session.getState()).toStrictEqual(expectedDefaultState);

        expect(log.error).toBeCalledTimes(1);

    });

    it("should validate that plugin is not active scene controller", () => {

        const nativePlugins = new FakeNativePlugins();

        const { plugin, expectedDefaultState } = createBasePlugin();
        nativePlugins.plugins = [
            plugin
        ]
        nativePlugins.isRegularPluginOrActiveSceneController = jest.fn(() => false);

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        session.setValue(["test-plugin", "foo"], "baz");

        expect(session.getState()).toStrictEqual(expectedDefaultState);

    });

    it("should validate that field definition exists", () => {

        const nativePlugins = new FakeNativePlugins();
        const { plugin, expectedDefaultState } = createBasePlugin();
        nativePlugins.plugins = [
            plugin
        ]
        plugin.getFieldDefinition = jest.fn(() => undefined);

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        session.setValue([plugin.name, "foo"], "baz");

        expect(session.getState()).toStrictEqual(expectedDefaultState);

        expect(plugin.getFieldDefinition).toBeCalledWith("foo");

    });

    it("should call hooks if merged", () => {

        const nativePlugins = new FakeNativePlugins();
        const { plugin } = createBasePlugin();

        nativePlugins.plugins = [
            plugin
        ]
        nativePlugins.hook_onConfigChanged = jest.fn();
        uiPlugins.sendMessage = jest.fn();

        const session = createPluginSessionStore(nativePlugins as any, uiPlugins as any);

        session.setValue(["test-plugin", "foo"], "baz");

        expect(session.getState()).toStrictEqual({ "test-plugin": { foo: "baz" } });

        expect(nativePlugins.hook_onConfigChanged).toBeCalledTimes(1);

        expect(nativePlugins.hook_onConfigChanged).toBeCalledWith(plugin.id, { foo: { value: 'baz' } });

        expect(uiPlugins.sendMessage).toBeCalledTimes(1);

    });
});