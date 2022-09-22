import { describe, it } from "@jest/globals";
import { ModifyValueActionEffect } from "common/types";
import { createMacroEffectAdapter } from "./create-macro-effect-adapter";

const util = {
    createDummyMacroAdapter: () => {
        const applyEffect = jest.fn();
        const getValue = jest.fn();
        const variableSetup = createMacroEffectAdapter(applyEffect, getValue);
        return { applyEffect, getValue, variableSetup, field: { value: null } };
    }
}

describe("CreateReactiveVariable", () => {

    it("should return value from getValue", () => {

        const testValue = "test-value";

        const applyEffect = jest.fn();
        const getValue = jest.fn(() => testValue);

        // createReactiveVariableStore aka MacroStore
        const variableSetup = createMacroEffectAdapter(applyEffect, getValue);

        const variable = variableSetup("Alex", []);

        expect(variable.value).toBe(testValue);

    });

    it("should return call getValue with path", () => {

        const { variableSetup, getValue } = util.createDummyMacroAdapter();

        const testPath = ["test", "path"];
        const variable = variableSetup("Alex", testPath);

        variable.value;

        expect(getValue).toBeCalledWith(testPath);

    });

    it("should apply Set effect with new value when assigning value", () => {

        const { variableSetup, applyEffect } = util.createDummyMacroAdapter();

        const testPath = ["test", "path"];
        const newValue = "new-value";
        const field = { value: "Alex" }

        const variable = variableSetup(field, testPath);

        variable.value = newValue;

        expect(applyEffect).toBeCalledWith(ModifyValueActionEffect.Set, testPath, field, newValue, undefined);

    });

    it("should convert non-value field to regular field when assigning value", () => {

        const { variableSetup, applyEffect } = util.createDummyMacroAdapter();

        const field = "Alex";
        const convertedField = { value: field }
        const variable = variableSetup(field, []);

        variable.value = null;

        expect(applyEffect).toBeCalledWith(ModifyValueActionEffect.Set, [], convertedField, null, undefined);

    });

    it.each([
        ["inc", ModifyValueActionEffect.Increase],
        ["incCycle", ModifyValueActionEffect.IncreaseCycle],
        ["dec", ModifyValueActionEffect.Decrease],
        ["decCycle", ModifyValueActionEffect.DecreaseCycle],
        ["min", ModifyValueActionEffect.Min],
        ["max", ModifyValueActionEffect.Max],
        ["reset", ModifyValueActionEffect.SetToDefault],
        ["toggle", ModifyValueActionEffect.Toggle],
    ])("%s should apply %s", (method, effect) => {
        const { variableSetup, applyEffect } = util.createDummyMacroAdapter();

        const field = { value: null }

        const variable = variableSetup(field, []);

        variable[method as keyof typeof variable]();

        expect(applyEffect).toBeCalledWith(effect, [], field, undefined, undefined);
    });

});