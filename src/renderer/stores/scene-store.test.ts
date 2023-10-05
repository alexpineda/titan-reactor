import { describe, it, jest, beforeEach, expect } from "@jest/globals";
import sceneStore, { SceneLoader } from "./scene-store";
import { log } from "@ipc/log";

jest.mock( "@ipc/log" );

const util = {
    createSceneState: ( props?: { beforeNext?: any } ) => ( {
        id: "@home",
        dispose: jest.fn(),
        start: jest.fn(),
        ...props,
    } ),
};

describe( "SceneStore", () => {
    beforeEach( () => {
        sceneStore().reset();
        sceneStore().clearError();
    } );

    it( "should log error and set error state", () => {
        const error = new Error( "test" );
        sceneStore().setError( error );

        expect( sceneStore().error ).toBe( error );
        /* eslint-disable-next-line @typescript-eslint/unbound-method */
        expect( log.error ).toHaveBeenCalledWith( error.message );
    } );

    it( "should clear error state", () => {
        const error = new Error( "test" );
        sceneStore().setError( error );
        sceneStore().clearError();

        expect( sceneStore().error ).toBe( null );
    } );

    it( "should async execute scene loader, async start, then assign state", async () => {
        const state = util.createSceneState();
        const loader = jest.fn( () => Promise.resolve( state ) );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );

        expect(
            state.start.mock.invocationCallOrder[0]! >
                loader.mock.invocationCallOrder[0]!
        ).toBe( true );

        expect( sceneStore().state ).toBe( state );
    } );

    it( "should sync execute scene loader, sync start, then assign state", async () => {
        const state = util.createSceneState();
        const loader = jest.fn( () => state );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );

        expect(
            state.start.mock.invocationCallOrder[0]! >
                loader.mock.invocationCallOrder[0]!
        ).toBe( true );

        expect( sceneStore().state ).toBe( state );
    } );

    it( "should call dispose on old state before loading next scene", async () => {
        const oldState = util.createSceneState();
        const loader = jest.fn( () => oldState );
        const nextLoader = jest.fn( () => util.createSceneState() );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );
        await sceneStore().execSceneLoader( nextLoader as SceneLoader, "@home" );

        expect(
            oldState.dispose.mock.invocationCallOrder[0]! <
                nextLoader.mock.invocationCallOrder[0]!
        ).toBe( true );
    } );

    it( "should clear error by default before loading next scene", async () => {
        const oldState = util.createSceneState();
        const loader = jest.fn( () => oldState );
        const nextLoader = jest.fn( () => util.createSceneState() );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );

        const error = new Error( "test" );

        sceneStore().setError( error );

        expect( sceneStore().error ).toBe( error );

        await sceneStore().execSceneLoader( nextLoader as SceneLoader, "@home" );

        expect( sceneStore().error ).toBe( null );
    } );

    it( "should call beforeNext after loading next scene but before calling start", async () => {
        const oldState = util.createSceneState( { beforeNext: jest.fn() } );
        const newState = util.createSceneState();
        const loader = jest.fn( () => oldState );
        const nextLoader = jest.fn( () => newState );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );
        await sceneStore().execSceneLoader( nextLoader as SceneLoader, "@home" );

        expect(
            nextLoader.mock.invocationCallOrder[0]! <
                oldState.beforeNext.mock.invocationCallOrder[0]
        ).toBe( true );

        expect(
            newState.start.mock.invocationCallOrder[0]! >
                oldState.beforeNext.mock.invocationCallOrder[0]
        ).toBe( true );
    } );

    it( "should call beforeNext after loading next scene but before calling start", async () => {
        const oldState = util.createSceneState( { beforeNext: jest.fn() } );
        const newState = util.createSceneState();
        const loader = jest.fn( () => oldState );
        const nextLoader = jest.fn( () => newState );

        await sceneStore().execSceneLoader( loader as SceneLoader, "@home" );
        await sceneStore().execSceneLoader( nextLoader as SceneLoader, "@home" );

        expect(
            nextLoader.mock.invocationCallOrder[0]! <
                oldState.beforeNext.mock.invocationCallOrder[0]
        ).toBe( true );

        expect(
            newState.start.mock.invocationCallOrder[0]! >
                oldState.beforeNext.mock.invocationCallOrder[0]
        ).toBe( true );
    } );
} );
