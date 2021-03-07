import MarkedObjectPool from "../MarkedObjectPool";
import { range } from "ramda";

test("length should return number of free items", () => {
  const container = new MarkedObjectPool(range(0, 10));
  expect(container.marked.length).toBe(0);
  expect(container.unmarked.length).toBe(10);

  container.mark(5);
  expect(container.marked.length).toBe(5);
  expect(container.unmarked.length).toBe(5);

  container.mark(5);
  expect(container.marked.length).toBe(10);
  expect(container.unmarked.length).toBe(0);
});

test("marking should throw if no unmarked available", () => {
  const container = new MarkedObjectPool(range(0, 2));

  container.mark(2);
  expect(container.marked.length).toBe(2);
  expect(container.unmarked.length).toBe(0);

  expect(() => container.mark(1)).toThrow();
});

test("unmarking should throw if no marked available", () => {
  const container = new MarkedObjectPool(range(0, 2));

  container.mark(2);
  expect(container.marked.length).toBe(2);
  expect(container.unmarked.length).toBe(0);

  container.unmark(1);
  expect(container.marked.length).toBe(1);
  expect(container.unmarked.length).toBe(1);

  expect(() => container.unmark(2)).toThrow();
});

test("getMarkedItems initial values", () => {
  const container = new MarkedObjectPool(range(0, 3));

  expect(container.unshift().length).toBe(0);
  expect(container.unmarked.length).toBe(3);
  expect(container.currentUnmarked).toBe(container.unmarked[0]);
});

test("getMarkedItems cycling index", () => {
  const container = new MarkedObjectPool(range(0, 3));
  let marked;

  container.mark(2);

  marked = container.unshift(1);
  expect(marked.length).toBe(1);
  expect(marked[0]).toBe(container.unmarked[1]);

  marked = container.unshift(1);
  expect(marked.length).toBe(1);
  expect(marked[0]).toBe(container.unmarked[2]);
});
