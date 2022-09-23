import { describe, it, jest } from "@jest/globals";
import { MacroActionType, MutationInstruction } from "common/types";
import { SettingsAndPluginsMeta } from "./settings-and-plugins-meta";
import * as levaConfig from "common/get-app-settings-leva-config";
import { getAvailableMutationInstructionsForAction, getAvailableMutationIntructionsForLiteralType } from "./get-macro-action-instructions";


jest.mock("common/get-app-settings-leva-config");

describe("getAvailableMutationInstructionsForAction", () => {

    describe("when type is ModifyAppSettings", () => {
        it("should return empty if there is no field definition", () => {

            jest.spyOn(levaConfig, "getAppSettingsPropertyInLevaFormat").mockReturnValue(undefined);

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyAppSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["audio", "music"]

            }, {} as SettingsAndPluginsMeta);

            expect(result).toStrictEqual([]);

        });

        it.each([
            [null, 0],
            [undefined, 0],
            [Symbol("test"), 0],
            [{}, 0],
            ["string", getAvailableMutationIntructionsForLiteralType("string").length],
            [true, getAvailableMutationIntructionsForLiteralType("boolean").length],
            [77, getAvailableMutationIntructionsForLiteralType("number").length]
        ])(`should return empty if the field definition is not a number, boolean or string`, (value, expectedLength) => {

            jest.spyOn(levaConfig, "getAppSettingsPropertyInLevaFormat").mockReturnValue({ value });

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyAppSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["audio", "music"]

            }, {} as SettingsAndPluginsMeta);

            expect(result).toHaveLength(expectedLength);

        });

        it("should treat a list as a number", () => {

            jest.spyOn(levaConfig, "getAppSettingsPropertyInLevaFormat").mockReturnValue({ options: [], value: null });

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyAppSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["audio", "music"]

            }, {} as SettingsAndPluginsMeta);

            expect(result).toHaveLength(getAvailableMutationIntructionsForLiteralType("number").length);


        });

    });

    describe("when type is CallGameTimeApi", () => {
        it("should return empty", () => {

            jest.spyOn(levaConfig, "getAppSettingsPropertyInLevaFormat").mockReturnValue({ value: "" });

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.CallGameTimeApi,
                id: "macro-action-id",
                value: ""

            }, {} as SettingsAndPluginsMeta);

            expect(result).toHaveLength(0);

        });
    });

    describe("when type is ModifyPluginSettings", () => {

        it("should return empty if there is no plugin", () => {

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyPluginSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["test-plugin", "music"]

            }, { enabledPlugins: [] } as unknown as SettingsAndPluginsMeta);

            expect(result).toStrictEqual([]);

        });

        it("should return empty if there is no field", () => {

            const enabledPlugins = [{}];
            jest.spyOn(enabledPlugins, "find").mockReturnValue({});

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyPluginSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["test-plugin", "music"]

            }, { enabledPlugins } as unknown as SettingsAndPluginsMeta);

            expect(result).toStrictEqual([]);
            expect(enabledPlugins.find).toHaveBeenCalled();

        });

        it.each([
            [null, 0],
            [undefined, 0],
            [Symbol("test"), 0],
            [{}, 0],
            ["string", getAvailableMutationIntructionsForLiteralType("string").length],
            [true, getAvailableMutationIntructionsForLiteralType("boolean").length],
            [77, getAvailableMutationIntructionsForLiteralType("number").length]
        ])(`should return empty if the field definition is not a number, boolean or string`, (value, expectedLength) => {

            const enabledPlugins = [{}];
            jest.spyOn(enabledPlugins, "find").mockReturnValue({
                config: {
                    "music": { value }
                }
            });

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyPluginSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["test-plugin", "music"]

            }, { enabledPlugins } as unknown as SettingsAndPluginsMeta);

            expect(result).toHaveLength(expectedLength);

        });

        it("should treat a list as a number", () => {

            const enabledPlugins = [{}];
            jest.spyOn(enabledPlugins, "find").mockReturnValue({
                config: {
                    "music": { options: [] }
                }
            });

            const result = getAvailableMutationInstructionsForAction({
                type: MacroActionType.ModifyPluginSettings,
                id: "macro-action-id",
                value: 0,
                instruction: MutationInstruction.Set,
                path: ["test-plugin", "music"]

            }, { enabledPlugins } as unknown as SettingsAndPluginsMeta);

            expect(result).toHaveLength(getAvailableMutationIntructionsForLiteralType("number").length);

        });

    });

});