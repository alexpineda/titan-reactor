import { describe, it } from "@jest/globals";
import create from "zustand";
import { createSessionStore } from "./session-store";


describe("SessionStore", () => {

    it("should create store", () => {

        const sourceOfTruth = create(() => ({

            foo: "bar"

        }));

        const store = createSessionStore({ sourceOfTruth });

        expect(store.getState()).toStrictEqual({ "foo": "bar" });

    });

    it("should get value at path", () => {

        const sourceOfTruth = create(() => ({
            foo: "bar"
        }));
        const store = createSessionStore({ sourceOfTruth });

        expect(store.getValue(["foo"])).toBe("bar");

    });

    it("should set value at path", () => {

        const sourceOfTruth = create(() => ({
            foo: "bar"
        }));
        const store = createSessionStore({ sourceOfTruth });

        expect(store.setValue(["foo"], "baz"));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should merge", () => {

        const sourceOfTruth = create(() => ({
            foo: "bar"
        }));
        const store = createSessionStore({ sourceOfTruth });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should merge if validate is true", () => {

        const sourceOfTruth = create(() => ({
            foo: "bar"
        }));
        const store = createSessionStore({ sourceOfTruth, validateMutation: () => true });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("baz");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

    it("should not merge if validate is false", () => {

        const sourceOfTruth = create(() => ({
            foo: "bar"
        }));
        const store = createSessionStore({ sourceOfTruth, validateMutation: () => false });

        expect(store.merge({ foo: "baz" }));

        expect(store.getValue(["foo"])).toBe("bar");
        expect(store.getResetValue(["foo"])).toBe("bar");

    });

});
