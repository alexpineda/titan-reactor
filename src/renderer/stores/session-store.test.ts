import { describe, it } from "@jest/globals";
import { createSessionStore } from "./session-store";

describe("SessionStore", () => {

    it("should create store", () => {

        const sourceOfTruth = {

            foo: "bar"

        }

        const store = createSessionStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

    });

    it("should get value at path", () => {

        const sourceOfTruth = {

            foo: "bar"

        }
        const store = createSessionStore({ sourceOfTruth });

        expect(store.getValue(["foo"])).toBe("bar");

    });

    it("should set value at path", () => {

        const sourceOfTruth = {

            foo: "bar"

        }
        const store = createSessionStore({ sourceOfTruth });

        expect(store.setValue(["foo"], "baz"));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should merge", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createSessionStore({ sourceOfTruth });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should merge deep", () => {

        const sourceOfTruth = {
            foo: {
                bar: "baz"
            }
        };
        const store = createSessionStore({ sourceOfTruth });

        expect(store.merge({ foo: { bar: "foo" } }));

        expect(store.getValue(["foo", "bar"])).toBe("foo");
        expect(store.getResetValue(["foo", "bar"])).toBe("baz");

    });

    it("should merge if validate is true", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createSessionStore({
            sourceOfTruth,
            validateMerge: () => true
        });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should not merge if validate is false", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createSessionStore({
            sourceOfTruth,
            validateMerge: () => false
        });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("bar");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

});
