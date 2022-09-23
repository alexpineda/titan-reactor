import { getFieldDefinitionDisplayValue, getMacroActionOrConditionLevaConfig } from "./get-macro-action-condition-field-definition";
import * as levaConfig from "common/get-app-settings-leva-config";

import { jest, describe, it } from "@jest/globals";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";

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

describe("getFieldDefinitionDisplayValue", () => {

    it("should return the value if options is undefined", () => {

        const result = getFieldDefinitionDisplayValue(undefined, "baz");

        expect(result).toBe("baz");

    });

    it("should return the value if options is an array", () => {

        const result = getFieldDefinitionDisplayValue(["foo", "bar"], "baz");

        expect(result).toBe("baz");

    });

    it("should return the key if options is an object and the value is found", () => {

        const result = getFieldDefinitionDisplayValue({ foo: "bar" }, "bar");

        expect(result).toBe("foo");

    });

});