import { ReplayPosition } from "../ReplayPosition";

function DummyClock() {
  this.stop = () => {};
  this.getElapsedTime = () => {};
  this.getDelta = () => {};
}

test("should not skip game frames if delta < gamespeed", () => {
  const clock = new DummyClock();
  clock.getDelta = () => 2;
  const maxGameFrame = 100;
  const gameSpeed = 3;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.paused = false;
  rp.update();
  expect(rp.skipGameFrames).toBe(0);
  expect(rp.lastDelta).toBe(2);
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(1);
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(0);
  rp.update();
  expect(rp.skipGameFrames).toBe(0);
  expect(rp.lastDelta).toBe(2);
});

test("should skip game 1 frame if delta === gamespeed", () => {
  const clock = new DummyClock();
  clock.getDelta = () => 1;
  const maxGameFrame = 100;
  const gameSpeed = 1;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.paused = false;
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(0);
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(0);
});

test("should skip game 2 frame if delta === 2x gamespeed", () => {
  const clock = new DummyClock();
  clock.getDelta = () => 2;
  const maxGameFrame = 100;
  const gameSpeed = 1;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.paused = false;
  rp.update();
  expect(rp.skipGameFrames).toBe(2);
  expect(rp.lastDelta).toBe(0);
  rp.update();
  expect(rp.skipGameFrames).toBe(2);
  expect(rp.lastDelta).toBe(0);
});

test("should skip game 1.5 frame if delta === 1.5x gamespeed", () => {
  const clock = new DummyClock();
  clock.getDelta = () => 1.5;
  const maxGameFrame = 100;
  const gameSpeed = 1;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.paused = false;
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(0.5);
  rp.update();
  expect(rp.skipGameFrames).toBe(2);
  expect(rp.lastDelta).toBe(0);
});
