import { describe, it, jest } from "@jest/globals";
import { createResettableStore } from "./resettable-store";
import { createOperatableStore } from "./operatable-store";
import { Operator } from "common/types";
import { SourceOfTruth } from "./source-of-truth";

jest.mock("@ipc/log");

describe("SessionStore", () => {

    it("should create resettable store", () => {

        const sourceOfTruth = new SourceOfTruth({

            foo: "bar"

        });

        const store = createResettableStore({ initialState: sourceOfTruth.snapshot() });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createOperatableStore(store, sourceOfTruth, () => ({
            value: null
        }));

        mutation.operate({
            path: ["foo"],
            operator: Operator.Set,
            value: "baz"
        });

        expect(store.getState()).toStrictEqual({ "foo": "baz" });
        expect(sourceOfTruth.getValue(["foo"])).toBe("bar");

    });

    it("should create operatable variables", () => {

        const sourceOfTruth = new SourceOfTruth({

            foo: "bar"

        });

        const store = createResettableStore({ initialState: sourceOfTruth.snapshot() });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createOperatableStore(store, sourceOfTruth, () => ({
            value: null
        }));

        const foo = mutation.createVariable(["foo"]);

        foo.value = "baz";

        expect(store.getState()).toStrictEqual({ "foo": "baz" });
        expect(sourceOfTruth.getValue(["foo"])).toBe("bar");

    });


    //TODO: update once we are not clobbering all state from source of truth

    it("should update source of truth", () => {

        const sourceOfTruth = new SourceOfTruth({

            foo: "bar",
            money: "lots"

        });

        const store = createOperatableStore(createResettableStore({
            initialState: sourceOfTruth.snapshot(),
        }), sourceOfTruth, () => ({
            value: null
        }));

        expect(store.sourceOfTruth.getValue(["foo"])).toBe("bar");
        expect(store.getValue(["foo"])).toBe("bar");

        store.setValue(["money"], "none");

        store.sourceOfTruth.update({
            foo: "baz"
        });

        expect(store.sourceOfTruth.getValue(["foo"])).toBe("baz");
        expect(store.sourceOfTruth.getValue(["money"])).toBe("lots");

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getValue(["money"])).toBe("none");



    });

});
