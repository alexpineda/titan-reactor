import { describe, it, jest } from "@jest/globals";
import { createMacroStore } from "./macros-store";
import * as settingsStoreModule from "@stores/settings-store";
import { ManualTrigger } from "@macros/manual-trigger";
import { MacroDTO, MacrosDTO  } from "common/types";
import * as sanitizeMacros from "common/macros/sanitize-macros";
import { SettingsStore } from "@stores/settings-store";

jest.mock( "@ipc/log" );
jest.mock( "@stores/settings-store" );
jest.mock( "common/macros/sanitize-macros" );

const util = {
    createMacroStore: ( macros: MacroDTO[] = [] ) => {
        const settingStoreState = {
            data: {
                macros: {
                    macros,
                    revision: 0,
                },
            },
            save: jest.fn( ( state: { macros: MacrosDTO } ) =>
                Promise.resolve( { data: state } )
            ),
        } as unknown as SettingsStore;

        //@ts-expect-error
        settingsStoreModule.settingsStore = jest.fn( () => settingStoreState );

        return { settingStoreState, macroStore: createMacroStore( jest.fn( () => settingStoreState ) ) };
    },
};

//todo mock out window.deps
describe( "createMacroStore", () => {
    beforeEach( () => {
        //@ts-expect-error
        sanitizeMacros.sanitizeActionable = jest.fn( ( actionable ) => actionable );
    } );

    it( "should be create macro", () => {
        const { macroStore } = util.createMacroStore();

        expect( macroStore.getState().macros.macros.length ).toBe( 0 );

        macroStore.getState().createMacro( "test", new ManualTrigger() );

        expect( macroStore.getState().macros.macros.length ).toBe( 1 );
    } );

    // it( "should increment revision macro", async () => {
    //     const { macroStore, settingStoreState } = util.createMacroStore();

    //     expect( macroStore.getState().macros.revision ).toBe( 0 );

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     expect( settingStoreState.save.mock.calls[0][0].macros.revision ).toBe( 1 );

    //     expect( macroStore.getState().macros.revision ).toBe( 0 );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.revision ).toBe( 1 );
    // } );

    // it( "should set busy when saving", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     expect( macroStore.getState().busy ).toBe( true );
    //     expect( macroStore.getState().macros.macros.length ).toBe( 1 );

    //     macroStore.getState().createMacro( "test2", new ManualTrigger() );
    //     expect( macroStore.getState().macros.macros.length ).toBe( 2 );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().busy ).toBe( false );
    //     expect( macroStore.getState().macros.macros.length ).toBe( 1 );
    // } );

    // it( "should update macro", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().updateMacro( { ...macro, name: "test2" } );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.macros[0].name ).toBe( "test2" );
    // } );

    // it( "should delete macro", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().deleteMacro( macro.id );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.macros.length ).toBe( 0 );
    // } );

    // it( "should create action actionable", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().createActionable( macro, {
    //         type: "action",
    //         id: "test",
    //         path: [ ":app" ],
    //         operator: Operator.Set,
    //     } );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.macros[0].actions.length ).toBe( 1 );
    //     expect( macroStore.getState().macros.macros[0].conditions.length ).toBe( 0 );
    // } );

    // it( "should delete action actionable", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     macroStore.getState().createActionable( macroStore.getState().macros.macros[0], {
    //         type: "action",
    //         id: "test",
    //         path: [ ":app" ],
    //         operator: Operator.Set,
    //     } );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().deleteActionable( macro, macro.actions[0] );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.macros[0].actions.length ).toBe( 0 );
    //     expect( macroStore.getState().macros.macros[0].conditions.length ).toBe( 0 );
    // } );

    // it( "should create condition actionable", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().createActionable( macro, {
    //         type: "condition",
    //         id: "test",
    //         path: [ ":app" ],
    //         comparator: ConditionComparator.Equals,
    //     } );

    //     await new Promise( process.nextTick );

    //     expect( macroStore.getState().macros.macros[0].actions.length ).toBe( 0 );
    //     expect( macroStore.getState().macros.macros[0].conditions.length ).toBe( 1 );
    // } );

    // it( "should delete condition actionable", async () => {
    //     const { macroStore } = util.createMacroStore();

    //     macroStore.getState().createMacro( "test", new ManualTrigger() );

    //     await new Promise( process.nextTick );

    //     macroStore.getState().createActionable( macroStore.getState().macros.macros[0], {
    //         type: "condition",
    //         id: "test",
    //         path: [ ":app" ],
    //         comparator: ConditionComparator.Equals,
    //     } );

    //     await new Promise( process.nextTick );

    //     const macro = macroStore.getState().macros.macros[0];

    //     macroStore.getState().deleteActionable( macro, macro.conditions[0] );

    //     expect( macroStore.getState().macros.macros[0].actions.length ).toBe( 0 );
    //     expect( macroStore.getState().macros.macros[0].conditions.length ).toBe( 0 );
    // } );
} );
