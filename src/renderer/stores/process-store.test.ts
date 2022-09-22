import { describe, it, jest } from "@jest/globals";
import processStore from "./process-store";

jest.mock("@ipc/log");

//TODO: fix this hack
Object.defineProperty(window.performance, 'mark', {
    configurable: true,
    value: jest.fn(),
});

Object.defineProperty(window.performance, 'clearMeasures', {
    configurable: true,
    value: jest.fn(),
});

Object.defineProperty(window.performance, 'clearMarks', {
    configurable: true,
    value: jest.fn(),
});

Object.defineProperty(window.performance, 'measure', {
    configurable: true,
    value: jest.fn(() => ({ duration: 100 })),
});

describe("ProcessStore", () => {

    beforeEach(() => {

        processStore().clearAll();

    });

    it("total should default to 0 with no processes", () => {

        expect(processStore().processes).toHaveLength(0);

        expect(processStore().getTotalProgress()).toBe(0);

    });

    it("create should add a process and return a wrapper", () => {

        const wrapper = processStore().create("test", 100);

        expect(processStore().processes).toHaveLength(1);

        expect(processStore().getTotalProgress()).toBe(0);

        expect(wrapper).toBeDefined();

    });

    it("should increment increment a process", () => {

        const wrapper = processStore().create("test", 2);

        expect(processStore().getTotalProgress()).toBe(0);

        wrapper.increment();

        expect(processStore().getTotalProgress()).toBe(0.5);

        expect(processStore().isInProgress(wrapper.id)).toBe(true);

        expect(processStore().isComplete(wrapper.id)).toBe(false);

    });

    it("should be complete if current === max", () => {

        const wrapper = processStore().create("test", 1);

        expect(processStore().getTotalProgress()).toBe(0);

        wrapper.increment();

        expect(processStore().getTotalProgress()).toBe(1);

        expect(processStore().isComplete(wrapper.id)).toBe(true);

        expect(processStore().isInProgress(wrapper.id)).toBe(false);


    });

    it("should clear completed when asked", () => {

        const wrapper = processStore().create("test", 1);
        const other = processStore().create("test2", 1);

        expect(processStore().getTotalProgress()).toBe(0);

        wrapper.increment();

        expect(processStore().getTotalProgress()).toBe(0.5);

        expect(processStore().isComplete(wrapper.id)).toBe(true);

        expect(processStore().isInProgress(wrapper.id)).toBe(false);

        expect(processStore().isComplete(other.id)).toBe(false);

        expect(processStore().isInProgress(other.id)).toBe(true);

        processStore().clearCompleted();

        expect(processStore().getTotalProgress()).toBe(0);

        expect(processStore().processes).toHaveLength(1);


    });


    it("should add to an open processwhen asked", () => {

        const wrapper = processStore().create("test", 1);
        const other = processStore().addOrCreate("test2", 1);

        expect(wrapper.id).toBe(other.id);

        expect(processStore().getTotalProgress()).toBe(0);

        wrapper.increment();

        expect(processStore().getTotalProgress()).toBe(0.5);

        other.increment();

        expect(processStore().getTotalProgress()).toBe(1);


    });

});