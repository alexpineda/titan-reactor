/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, jest } from "@jest/globals";
import { TypeEmitter } from "@utils/type-emitter";
import { createSettingsSessionStore } from "./settings-session-store";
import { WorldEvents } from "./world-events";
import * as settingsStore from "@stores/settings-store";
import { Operator } from "common/types";

jest.mock( "@ipc/log" );
jest.mock( "@utils/type-emitter" );
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
    data: {
        session: {},
        audio: {
            music: 0,
        },
        input: {
            mouseSensitivity: 1,
        },
        minimap: {
            zoom: 2,
        },
        postprocessing: {
            bloom: 3,
        },
        postprocessing3d: {
            bloom: 4,
        },
    },
};
const createBaseStore = () =>
    jest.fn( () => JSON.parse( JSON.stringify( initialState ) ) as unknown );

describe( "SettingsSessionStore", () => {
    beforeEach( () => {
        //@ts-expect-error
        settingsStore.settingsStore = createBaseStore();
    } );

    it( "should have initial state", () => {
        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore( events );

        expect( session.getState() ).toStrictEqual( initialState.data );
    } );

    // expect this test to break once the diff merge is introduced
    it( "should merge from settings store and emit event", () => {
        let callback: ( args: any ) => void;

        //@ts-expect-error
        settingsStore.useSettingsStore = {
            subscribe: jest.fn( ( cb: ( args: any ) => void ) => {
                callback = cb;
            } ),
        };

        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore( events );

        expect( session.getState() ).toStrictEqual( initialState.data );

        const rhs = { data: { audio: { music: 1 } } };
        callback!( rhs );

        expect( events.emit ).toBeCalledTimes( 1 );
        expect( events.emit ).toBeCalledWith( "settings-changed", {
            settings: {
                ...initialState.data,
                audio: { music: 1 },
            },
            rhs: rhs.data,
        } );
    } );

    it( "getRawValue should return value at path", () => {
        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore( events );

        expect( session.getValue( ["minimap", "zoom"] ) ).toBe( 2 );
    } );

    it( "mutate should apply effect", () => {
        const events = new TypeEmitter<WorldEvents>();
        const session = createSettingsSessionStore( events );

        session.operate( {
            path: ["audio", "music"],
            value: 0.5,
            operator: Operator.Set,
        } );

        expect( session.getState() ).toStrictEqual( {
            ...initialState.data,
            audio: { music: 0.5 },
        } );
    } );
} );
