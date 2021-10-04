import MarkedObjectPool from "../MarkedObjectPool";
import FrameBW from "../FrameBW";

test("length should return number of free items", () => {
  const container = new MarkedObjectPool(10);
  expect(container.marked.length).toBe(0);
  expect(container.unmarked).toBeInstanceOf(FrameBW);

  container.mark();
  expect(container.marked.length).toBe(1);

  container.mark();
  expect(container.marked.length).toBe(2);
});

test("marking should throw if no unmarked available", () => {
  const container = new MarkedObjectPool(1);

  container.mark();
  expect(container.marked.length).toBe(1);
  expect(() => container.mark()).toThrow();
});

test("unmarking should throw if no marked available", () => {
  const container = new MarkedObjectPool(2);

  container.mark();
  expect(container.marked.length).toBe(1);

  container.unmark();
  expect(container.marked.length).toBe(0);

  expect(() => container.unmark()).toThrow();
});
