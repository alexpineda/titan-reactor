import { describe, it, jest } from "@jest/globals";
import { MacroAction, MacroActionSequence, MacroDTO, Operator, TriggerType } from "common/types";
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
        };
    },

    createAction(partial?: Partial<MacroAction>): MacroAction {

        return {
            type: "action",
            id: "1",
            operator: Operator.SetToDefault,
            path: [":app"],
            ...partial
        };
    }
};

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
});