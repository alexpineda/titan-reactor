import { GameStatePosition } from "../game-state-position";

describe("GameStatePosition", () => {
  test("should not skip game frames if delta < gamespeed", () => {
    const maxGameFrame = 100;
    const gameSpeed = 3;
    const delta = 2;

    const rp = new GameStatePosition(maxGameFrame, gameSpeed, null);
    rp.paused = false;
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(0);
    expect(rp.lastDelta).toBe(2);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(1);
    expect(rp.lastDelta).toBe(1);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(1);
    expect(rp.lastDelta).toBe(0);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(0);
    expect(rp.lastDelta).toBe(2);
  });

  test("should skip game 1 frame if delta === gamespeed", () => {
    const maxGameFrame = 100;
    const gameSpeed = 1;
    const delta = 1;

    const rp = new GameStatePosition(maxGameFrame, gameSpeed, null);
    rp.paused = false;
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(1);
    expect(rp.lastDelta).toBe(0);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(1);
    expect(rp.lastDelta).toBe(0);
  });

  test("should skip game 2 frame if delta === 2x gamespeed", () => {
    const maxGameFrame = 100;
    const gameSpeed = 1;
    const delta = 2;

    const rp = new GameStatePosition(maxGameFrame, gameSpeed, null);
    rp.paused = false;
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(2);
    expect(rp.lastDelta).toBe(0);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(2);
    expect(rp.lastDelta).toBe(0);
  });

  test("should skip game 1.5 frame if delta === 1.5x gamespeed", () => {
    const maxGameFrame = 100;
    const gameSpeed = 1;
    const delta = 1.5;

    const rp = new GameStatePosition(maxGameFrame, gameSpeed, null);
    rp.paused = false;
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(1);
    expect(rp.lastDelta).toBe(0.5);
    rp.update(delta);
    expect(rp.advanceGameFrames).toBe(2);
    expect(rp.lastDelta).toBe(0);
  });
});
