import { describe, it, jest } from "@jest/globals";
import sceneStore, { SceneLoader } from "./scene-store";
import { log } from "@ipc/log";

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock("@ipc/log");

const util = {
    createSceneState: (props?: { beforeNext?: any }) => ({ id: "@home", dispose: jest.fn(), start: jest.fn(), ...props })
}

// should call dispose on old state
// should log error if dispose failed
// should call beforeNext on old state
// should call start on new state
// should log error if start failed
// should call setError if start failed
// should load errorhandler if start failed

describe("SceneStore", () => {

    beforeEach(() => {

        sceneStore().reset();
        sceneStore().clearError();

    });

    it("should log error and set error state", () => {

        const error = new Error("test");
        sceneStore().setError(error);

        expect(sceneStore().error).toBe(error);
        expect(log.error).toHaveBeenCalledWith(error.message);


    })

    it("should clear error state", () => {

        const error = new Error("test");
        sceneStore().setError(error);
        sceneStore().clearError();

        expect(sceneStore().error).toBe(null);

    });


    it("should async execute scene loader, async start, then assign state", async () => {

        const state = util.createSceneState();
        const loader = jest.fn(() => Promise.resolve(state));

        await sceneStore().execSceneLoader(loader as SceneLoader);

        expect(state.start.mock.invocationCallOrder[0] > loader.mock.invocationCallOrder[0]
        ).toBe(true);

        expect(sceneStore().state).toBe(state);

    });

    it("should sync execute scene loader, sync start, then assign state", async () => {

        const state = util.createSceneState();
        const loader = jest.fn(() => state);

        await sceneStore().execSceneLoader(loader as SceneLoader);

        expect(state.start.mock.invocationCallOrder[0] > loader.mock.invocationCallOrder[0]
        ).toBe(true);

        expect(sceneStore().state).toBe(state);

    });

    it("should call dispose on old state before loading next scene", async () => {

        const oldState = util.createSceneState();
        const loader = jest.fn(() => oldState);
        const nextLoader = jest.fn(() => util.createSceneState());

        await sceneStore().execSceneLoader(loader as SceneLoader);
        await sceneStore().execSceneLoader(nextLoader as SceneLoader);

        expect(oldState.dispose.mock.invocationCallOrder[0] < nextLoader.mock.invocationCallOrder[0]
        ).toBe(true);

    });

    it("should clear error by default before loading next scene", async () => {

        const oldState = util.createSceneState();
        const loader = jest.fn(() => oldState);
        const nextLoader = jest.fn(() => util.createSceneState());

        await sceneStore().execSceneLoader(loader as SceneLoader);

        const error = new Error("test");

        sceneStore().setError(error);

        expect(sceneStore().error).toBe(error);

        await sceneStore().execSceneLoader(nextLoader as SceneLoader);

        expect(sceneStore().error).toBe(null);

    });

    it("should call beforeNext after loading next scene but before calling start", async () => {

        const oldState = util.createSceneState({ beforeNext: jest.fn() });
        const newState = util.createSceneState();
        const loader = jest.fn(() => oldState);
        const nextLoader = jest.fn(() => newState);

        await sceneStore().execSceneLoader(loader as SceneLoader);
        await sceneStore().execSceneLoader(nextLoader as SceneLoader);

        expect(nextLoader.mock.invocationCallOrder[0] < oldState.beforeNext!.mock.invocationCallOrder[0]).toBe(true);

        expect(newState.start.mock.invocationCallOrder[0] > oldState.beforeNext!.mock.invocationCallOrder[0]).toBe(true);

    });
});