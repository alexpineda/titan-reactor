import { describe, it, jest, expect } from "@jest/globals";
import { createDeepStore } from "./deep-store";
import { createOperatableStore } from "./operatable-store";
import { Operator } from "common/types";
import { SourceOfTruth } from "./source-of-truth";

jest.mock( "@ipc/log" );

describe( "OperatableStore", () => {
    it( "should create store", () => {
        const sourceOfTruth = new SourceOfTruth( {
            foo: "bar",
        } );

        const store = createDeepStore( { initialState: sourceOfTruth.clone() } );

        expect( store.getState() ).toStrictEqual( { foo: "bar" } );

        const mutation = createOperatableStore( store, sourceOfTruth, () => ( {
            value: "",
        } ) );

        mutation.operate( {
            path: ["foo"],
            operator: Operator.Set,
            value: "baz",
        } );

        expect( store.getState() ).toStrictEqual( { foo: "baz" } );
        expect( sourceOfTruth.getValue( ["foo"] ) ).toBe( "bar" );
    } );

    it( "should create operatable variables", () => {
        const sourceOfTruth = new SourceOfTruth( {
            foo: "bar",
        } );

        const store = createDeepStore( { initialState: sourceOfTruth.clone() } );

        const mutation = createOperatableStore( store, sourceOfTruth, () => ( {
            value: "bar",
        } ) );

        const foo = mutation.createVariable( ["foo"] );

        expect( foo() ).toBe( "bar" );
        expect( store.getState() ).toStrictEqual( { foo: "bar" } );

        foo( "baz" );

        expect( store.getState() ).toStrictEqual( { foo: "baz" } );
        expect( foo() ).toBe( "baz" );
        expect( sourceOfTruth.getValue( ["foo"] ) ).toBe( "bar" );
    } );

    it( "should apply operations variables", () => {
        const sourceOfTruth = new SourceOfTruth( {
            foo: 0,
        } );

        const store = createDeepStore( { initialState: sourceOfTruth.clone() } );

        const mutation = createOperatableStore( store, sourceOfTruth, () => ( {
            value: 0,
            step: 1,
        } ) );

        const foo = mutation.createVariable( ["foo"] );

        // expect(foo()).toBe("bar");
        expect( store.getState() ).toStrictEqual( { foo: 0 } );

        foo.inc();

        expect( store.getState() ).toStrictEqual( { foo: 1 } );
    } );

    //TODO: update once we are not clobbering all state from source of truth

    it( "should update source of truth", () => {
        const sourceOfTruth = new SourceOfTruth( {
            foo: "bar",
            money: "lots",
        } );

        const store = createOperatableStore(
            createDeepStore( {
                initialState: sourceOfTruth.clone(),
            } ),
            sourceOfTruth,
            () => ( {
                value: null,
            } )
        );

        expect( store.sourceOfTruth.getValue( ["foo"] ) ).toBe( "bar" );
        expect( store.getValue( ["foo"] ) ).toBe( "bar" );

        store.setValue( ["money"], "none" );

        store.sourceOfTruth.update( {
            foo: "baz",
        } );

        expect( store.sourceOfTruth.getValue( ["foo"] ) ).toBe( "baz" );
        expect( store.sourceOfTruth.getValue( ["money"] ) ).toBe( "lots" );

        expect( store.getValue( ["foo"] ) ).toBe( "baz" );
        expect( store.getValue( ["money"] ) ).toBe( "none" );
    } );
} );
