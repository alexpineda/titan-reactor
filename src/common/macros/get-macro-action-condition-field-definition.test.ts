import { getMacroActionOrConditionLevaConfig } from "./get-macro-action-condition-field-definition";
import * as levaConfig from "common/get-app-settings-leva-config";

import { jest, describe, it } from "@jest/globals";
import { SettingsAndPluginsMeta } from "./field-utilities";

jest.mock("common/get-app-settings-leva-config");


describe("getMacroActionOrConditionLevaConfig", () => {

    it("should return the leva config for the given path", () => {

        //@ts-ignore
        levaConfig.getAppSettingsPropertyInLevaFormat = jest.fn().mockReturnValue({
            foo: "bar"
        });

        const result = getMacroActionOrConditionLevaConfig({ value: "baz", path: ["apple"] }, {} as SettingsAndPluginsMeta);

        expect(result).toStrictEqual({
            foo: "bar",
            value: "baz",
            displayValue: "baz"
        });

    });

});