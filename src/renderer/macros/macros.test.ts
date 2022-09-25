import { describe, it, jest } from "@jest/globals";
import { Macro } from "./macro";
import { ManualTrigger } from "./manual-trigger";
import { MacroAction, MacroActionSequence, Operator } from "common/types";

jest.mock("@ipc/log");

const util = {
    createAction(partial?: Partial<MacroAction>): MacroAction {

        return {
            type: "action",
            id: "1",
            operator: Operator.SetToDefault,
            path: [":app"],
            ...partial
        };
    }
}

describe("Macro", () => {

    it("should return all actions if AllSync", () => {

        const macro = new Macro("id", "label", new ManualTrigger(), [
            util.createAction(),
            util.createAction(),
            util.createAction(),
        ]);

        macro.actionSequence = MacroActionSequence.AllSync;

        expect(macro.getActionSequence()).toHaveLength(3);

    });

    it("should alternate cycle if SingleAlternat ", () => {

        const macro = new Macro("id", "label", new ManualTrigger(), [
            util.createAction({ id: "1" }),
            util.createAction({ id: "2" }),
            util.createAction({ id: "3" }),
        ]);

        macro.actionSequence = MacroActionSequence.SingleAlternate;

        expect(macro.getActionSequence()[0].id).toBe("1");
        expect(macro.getActionSequence()[0].id).toBe("2");
        expect(macro.getActionSequence()[0].id).toBe("3");
        expect(macro.getActionSequence()[0].id).toBe("1");

    });


    it("should return only one if Single Random", () => {

        const macro = new Macro("id", "label", new ManualTrigger(), [
            util.createAction({ id: "1" }),
            util.createAction({ id: "2" }),
            util.createAction({ id: "3" }),
        ]);

        macro.actionSequence = MacroActionSequence.SingleRandom;

        expect(macro.getActionSequence()).toHaveLength(1);

    });

});