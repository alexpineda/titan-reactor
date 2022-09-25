import { describe, it, jest } from "@jest/globals";
import { createResettableStore } from "./resettable-store";
import { createOperatableStore } from "./operatable-store";
import { Operator } from "common/types";

jest.mock("@ipc/log");

describe("SessionStore", () => {

    it("should create mutation store", () => {

        const sourceOfTruth = {

            foo: "bar"

        };

        const store = createResettableStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createOperatableStore(store, () => ({
            value: null
        }));

        mutation.operate({
            path: ["foo"],
            operator: Operator.Set,
            value: "baz"
        });

        expect(store.getState()).toStrictEqual({ "foo": "baz" });

    });

    it("should create mutation variables", () => {

        const sourceOfTruth = {

            foo: "bar"

        };

        const store = createResettableStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createOperatableStore(store, () => ({
            value: null
        }));

        const foo = mutation.createVariable(["foo"]);

        foo.value = "baz";

        expect(store.getState()).toStrictEqual({ "foo": "baz" });

    });

});
