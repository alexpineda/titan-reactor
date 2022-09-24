import { describe, it } from "@jest/globals";
import { createResettableStore } from "./session-store";

describe("SessionStore", () => {

    it("should create store", () => {

        const sourceOfTruth = {

            foo: "bar"

        }

        const store = createResettableStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

    });

    it("should get value at path", () => {

        const sourceOfTruth = {

            foo: "bar"

        }
        const store = createResettableStore({ sourceOfTruth });

        expect(store.getValue(["foo"])).toBe("bar");

    });

    it("should set value at path", () => {

        const sourceOfTruth = {

            foo: "bar"

        }
        const store = createResettableStore({ sourceOfTruth });

        expect(store.setValue(["foo"], "baz"));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should merge", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createResettableStore({ sourceOfTruth });

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
        const store = createResettableStore({ sourceOfTruth });

        expect(store.merge({ foo: { bar: "foo" } }));

        expect(store.getValue(["foo", "bar"])).toBe("foo");
        expect(store.getResetValue(["foo", "bar"])).toBe("baz");

    });

    it("should merge if validate is true", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createResettableStore({
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
        const store = createResettableStore({
            sourceOfTruth,
            validateMerge: () => false
        });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("bar");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should copy source of truth", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createResettableStore({
            sourceOfTruth,
        });

        sourceOfTruth.foo = "baz";

        expect(store.getResetValue(["foo"])).toBe("bar");

        expect(store.getValue(["foo"])).toBe("bar");

    });

    it("should update source of truth", () => {

        const sourceOfTruth = {
            foo: "bar"
        };
        const store = createResettableStore({
            sourceOfTruth,
        });

        sourceOfTruth.foo = "baz";

        expect(store.getResetValue(["foo"])).toBe("bar");
        expect(store.getValue(["foo"])).toBe("bar");

        store.updateSourceOfTruth(sourceOfTruth);

        expect(store.getResetValue(["foo"])).toBe("baz");
        expect(store.getValue(["foo"])).toBe("bar");



    });

});
