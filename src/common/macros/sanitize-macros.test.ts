import { describe, it, jest } from "@jest/globals";
import { MacroActionConfigurationErrorType, MacroActionHostModifyValue, MacroActionSequence, MacroActionType, MacroDTO, MutationInstruction, TriggerType } from "common/types";
import { SettingsAndPluginsMeta } from "./field-utilities";
import { sanitizeMacros } from "./sanitize-macros";

jest.mock("./field-utilities");

const util = {
    createMacro(partial?: Partial<MacroDTO>) {
        return {
            id: "1",
            name: "test",
            actions: [],
            conditions: [],
            actionSequence: MacroActionSequence.AllSync,
            enabled: true,
            trigger: {
                type: TriggerType.Manual
            },
            ...partial
        }
    },

    createAction(partial?: Partial<MacroActionHostModifyValue>): MacroActionHostModifyValue {

        return {
            id: "1",
            instruction: MutationInstruction.SetToDefault,
            path: ["test"],
            type: MacroActionType.ModifyAppSettings,
            ...partial
        }
    }
}

describe("sanitizeMacros", () => {

    it("should clear macro errors", () => {

        const macro = util.createMacro({
            error: "some error",
        });

        expect(macro.error).toBeDefined();

        sanitizeMacros({
            macros: [
                macro
            ], revision: 0
        }, {} as SettingsAndPluginsMeta);

        expect(macro.error).toBeUndefined();

    });

    it("should clear action errors", () => {

        const action = util.createAction({ error: { message: "some error", type: MacroActionConfigurationErrorType.InvalidAction } });

        const macro = util.createMacro({
            actions: [
                action
            ]
        });

        expect(action.error).toBeDefined();

        sanitizeMacros({
            macros: [
                macro
            ], revision: 0
        }, {} as SettingsAndPluginsMeta);

        expect(action.error).toBeUndefined();

    });

});