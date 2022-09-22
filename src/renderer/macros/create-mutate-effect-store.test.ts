import { describe, it } from "@jest/globals";
import { MutateActionEffect } from "common/types";
import { createMutateEffectStore } from "./create-mutate-effect-store";

const util = {
    createDummyStore: () => {
        const applyEffect = jest.fn();
        const getValue = jest.fn();
        const createVar = createMutateEffectStore(applyEffect, getValue);
        return { applyEffect, getValue, createVar, field: { value: null } };
    }
}

describe("CreateReactiveVariable", () => {

    it("should return value from getValue", () => {

        const testValue = "test-value";

        const applyEffect = jest.fn();
        const getValue = jest.fn(() => testValue);

        // createReactiveVariableStore aka MacroStore
        const variableSetup = createMutateEffectStore(applyEffect, getValue);

        const variable = variableSetup("Alex", []);

        expect(variable.value).toBe(testValue);

    });

    it("should return call getValue with path", () => {

        const { createVar, getValue } = util.createDummyStore();

        const testPath = ["test", "path"];
        const variable = createVar("Alex", testPath);

        variable.value;

        expect(getValue).toBeCalledWith(testPath);

    });

    it("should apply Set effect with new value when assigning value", () => {

        const { createVar, applyEffect } = util.createDummyStore();

        const testPath = ["test", "path"];
        const newValue = "new-value";
        const field = { value: "Alex" }

        const variable = createVar(field, testPath);

        variable.value = newValue;

        expect(applyEffect).toBeCalledWith(MutateActionEffect.Set, testPath, field, newValue, undefined);

    });

    it("should convert non-value field to regular field when assigning value", () => {

        const { createVar, applyEffect } = util.createDummyStore();

        const field = "Alex";
        const convertedField = { value: field }
        const variable = createVar(field, []);

        variable.value = null;

        expect(applyEffect).toBeCalledWith(MutateActionEffect.Set, [], convertedField, null, undefined);

    });

    it.each([
        ["inc", MutateActionEffect.Increase],
        ["incCycle", MutateActionEffect.IncreaseCycle],
        ["dec", MutateActionEffect.Decrease],
        ["decCycle", MutateActionEffect.DecreaseCycle],
        ["min", MutateActionEffect.Min],
        ["max", MutateActionEffect.Max],
        ["reset", MutateActionEffect.SetToDefault],
        ["toggle", MutateActionEffect.Toggle],
    ])("%s should apply %s", (method, effect) => {
        const { createVar, applyEffect } = util.createDummyStore();

        const field = { value: null }

        const variable = createVar(field, []);

        variable[method as keyof typeof variable]();

        expect(applyEffect).toBeCalledWith(effect, [], field, undefined, undefined);
    });

});