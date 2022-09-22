import { describe, it, jest } from "@jest/globals";
import { createSessionStore } from "./session-store";
import { createMutationStore } from "./mutation-store";
import { MutationInstruction } from "common/types";

jest.mock("@ipc/log");

describe("SessionStore", () => {

    it("should create mutation store", () => {

        const sourceOfTruth = {

            foo: "bar"

        };

        const store = createSessionStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createMutationStore(store, () => ({
            value: null
        }));

        mutation.mutate({
            path: ["foo"],
            instruction: MutationInstruction.Set,
            value: "baz"
        });

        expect(store.getState()).toStrictEqual({ "foo": "baz" });

    });

    it("should create mutation variables", () => {

        const sourceOfTruth = {

            foo: "bar"

        };

        const store = createSessionStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

        const mutation = createMutationStore(store, () => ({
            value: null
        }));

        const foo = mutation.createVariable(["foo"]);

        foo.value = "baz";

        expect(store.getState()).toStrictEqual({ "foo": "baz" });

    });

});
