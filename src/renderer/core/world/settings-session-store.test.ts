import { describe, it, jest } from "@jest/globals";
import { TypeEmitter } from "@utils/type-emitter";
import { createSettingsSessionStore } from "./resettable-store";
import { WorldEvents } from "./world";
import * as settingsStore from "@stores/settings-store";
import { Operator } from "common/types";

jest.mock("@ipc/log");
jest.mock("@utils/type-emitter");
jest.mock("@stores/settings-store", () => ({
    __esModule: true,
    settingsStore: null,
    useSettingsStore: {
        subscribe: jest.fn()
    },
}));
jest.mock("three-janitor");

const initialState = {
    enabledPlugins: [],
    data: {
        audio: {
            music: 0
        },
        input: {
            mouseSensitivity: 1
        },
        minimap: {
            zoom: 2
        },
        postprocessing: {
            bloom: 3
        },
        postprocessing3d: {
            bloom: 4
        }
    }
};
const createBaseStore = () => jest.fn(() => JSON.parse(JSON.stringify(initialState)));

describe("SettingsSessionStore", () => {

    beforeEach(() => {
        //@ts-ignore
        settingsStore.settingsStore = createBaseStore();
    });

    it("should have initial state", () => {
        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore(events);

        expect(session.getState()).toStrictEqual(initialState.data);

    });

    it("should merge from settings store and emit event", () => {
        let callback: Function;

        //@ts-ignore
        settingsStore.useSettingsStore = {
            subscribe: jest.fn((cb: Function) => {
                callback = cb;
            })
        };

        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore(events);

        expect(session.getState()).toStrictEqual(initialState.data);

        callback!({ data: { audio: { music: 1 } } });

        expect(events.emit).toBeCalledTimes(1);
        expect(events.emit).toBeCalledWith("settings-changed", {
            settings: {
                ...initialState.data,
                audio: { music: 1 }
            },
            rhs: { audio: { music: 1 } }
        });
    });


    it("getRawValue should return value at path", () => {
        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore(events);

        expect(session.getValue(["minimap", "zoom"])).toBe(2);
    });

    it("mutate should apply effect", () => {

        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore(events);

        session.operate({
            path: ["audio", "music"],
            value: 0.5,
            operator: Operator.Set
        });

        expect(session.getState()).toStrictEqual({
            ...initialState.data,
            audio: { music: 0.5 }
        });
    });
});