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
  rp.update();
  expect(rp.skipGameFrames).toBe(1);
  expect(rp.lastDelta).toBe(0.5);
  rp.update();
  expect(rp.skipGameFrames).toBe(2);
  expect(rp.lastDelta).toBe(0);
});

test("delta result in skip > max skip speed will use goto()", () => {
  const clock = new DummyClock();
  clock.getDelta = () => 200;
  const maxGameFrame = 1000;
  const gameSpeed = 1;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.update();
  expect(rp.skipGameFrames).toBe(0);
  expect(rp.lastDelta).toBe(0);
  expect(rp.destination).toBe(200);
  rp.update();
  expect(rp.skipGameFrames).toBe(100);
});

test("goto won't exceed max frame", () => {
  const clock = new DummyClock();
  const maxGameFrame = 77;
  const gameSpeed = 1;

  const rp = new ReplayPosition(maxGameFrame, clock, gameSpeed);
  rp.goto(99);
  expect(rp.destination).toBe(77);
});
