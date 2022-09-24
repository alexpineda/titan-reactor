import { describe, it, jest } from "@jest/globals";
import { applyMutationInstruction } from "./apply-mutation-instruction"
import { Operator } from "common/types";

jest.mock("@ipc/log");

describe("macroEffectApplyNumeric", () => {

    it("should set value", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: 0 }, 1, undefined);
        expect(effect).toBe(1);
    });

    it("should not apply the value if it is undefined", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: 0 }, undefined, undefined);
        expect(effect).toBe(0);
    });

    it("should clamp the value at max if it is defined", () => {
        const unclamped = applyMutationInstruction(Operator.Set, { value: 0 }, 3, undefined);
        expect(unclamped).toBe(3);

        const effect = applyMutationInstruction(Operator.Set, { value: 0, max: 2 }, 3, undefined);
        expect(effect).toBe(2);
    });

    it("should clamp the value at min if it is defined", () => {
        const unclamped = applyMutationInstruction(Operator.Set, { value: 5 }, 3, undefined);
        expect(unclamped).toBe(3);

        const effect = applyMutationInstruction(Operator.Set, { value: 5, min: 4 }, 3, undefined);
        expect(effect).toBe(4);
    });

    it("should set value to default", () => {
        const effect = applyMutationInstruction(Operator.SetToDefault, { value: 0 }, undefined, 2);
        expect(effect).toBe(2);
    });

    it.each([
        [{ value: 0 }, 0],
        [{ value: 0, step: 1 }, 1],
        [{ value: 0, max: 1 }, 0],
    ])("should only increase the value if step is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.Increase, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 1 }, 1],
        [{ value: 1, step: 1 }, 0],
        [{ value: 1, min: 1 }, 1],
    ])("should only decrease the value if step is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.Decrease, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 0 }, 0],
        [{ value: 0, step: 1 }, 1],
        [{ value: 0, max: 1 }, 0],
    ])("should only increase the value if step is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.IncreaseCycle, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 1 }, 1],
        [{ value: 1, step: 1 }, 0],
        [{ value: 1, min: 1 }, 1],
    ])("should only decrease the value if step is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.DecreaseCycle, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 0, step: 10, min: 0, max: 5 }, 0],
        [{ value: 0.5, step: 0.1, max: 0.5, min: 0.3 }, 0.3],
    ])("should set value to min if cycled beyond max", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.IncreaseCycle, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 5, step: 6, min: 3, max: 5 }, 5],
        [{ value: 0.5, step: 0.1, max: 0.6, min: 0.5 }, 0.6],
    ])("should set value to max if cycled beyond min", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.DecreaseCycle, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });


    it.each([
        [{ value: 1 }, 1],
        [{ value: 1, max: Number.POSITIVE_INFINITY }, 1],
        [{ value: 1, max: 2 }, 2],
    ])("should only max the value if field is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.Max, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

    it.each([
        [{ value: 4 }, 4],
        [{ value: 4, min: Number.NEGATIVE_INFINITY }, 4],
        [{ value: 4, min: 2 }, 2],
    ])("should only min the value if field is finite", (field, expected) => {
        const effectResult = applyMutationInstruction(Operator.Min, field, undefined, undefined);
        expect(effectResult).toBe(expected);
    });

});



describe("macroEffectApplyList", () => {

    afterAll(() =>
        jest.resetAllMocks()
    );

    it("should set value", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: "a", options: ["a", "b"] }, "b", undefined);
        expect(effect).toBe("b");
    });

    it("should not set value if option does not exist", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: "a", options: ["a", "b"] }, "c", undefined);
        expect(effect).toBe("a");
    });

    it("should set 0th option if field.value is invalid", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: "c", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("a");
    });

    it("should accept object option types", () => {
        const effect = applyMutationInstruction(Operator.Set, { value: "a", options: { "Letter A": "a", "Letter B": "b" } }, "b", undefined);
        expect(effect).toBe("b");
    });

    it("should increase the value", () => {
        const effect = applyMutationInstruction(Operator.Increase, { value: "a", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("b");
    });


    it("should clamp the increased the value", () => {
        const effect = applyMutationInstruction(Operator.Increase, { value: "b", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("b");
    });

    it("should decrease the value", () => {
        const effect = applyMutationInstruction(Operator.Decrease, { value: "b", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("a");
    });


    it("should clamp the decreased the value", () => {
        const effect = applyMutationInstruction(Operator.Decrease, { value: "a", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("a");
    });

    it("should cycle the increased the value", () => {
        const effect = applyMutationInstruction(Operator.IncreaseCycle, { value: "b", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("a");
    });

    it("should cycle the decreased the value", () => {
        const effect = applyMutationInstruction(Operator.DecreaseCycle, { value: "a", options: ["a", "b"] }, null, undefined);
        expect(effect).toBe("b");
    });

    it("should set max", () => {
        const effect = applyMutationInstruction(Operator.Max, { value: "a", options: ["a", "b", "c"] }, null, undefined);
        expect(effect).toBe("c");
    });

    it("should set min", () => {
        const effect = applyMutationInstruction(Operator.Min, { value: "c", options: ["a", "b", "c"] }, null, undefined);
        expect(effect).toBe("a");
    });

});