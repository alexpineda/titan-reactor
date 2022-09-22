import { describe, it } from "@jest/globals";
import processStore from "./process-store";
describe("ProcessStore", () => {

    it("should have empty processes on init", () => {

        expect(processStore().processes).toHaveLength(0);

    });


});