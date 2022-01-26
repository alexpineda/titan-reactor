// @ts-nocheck

import FrameBW from "./frame";

// a fixed pool of objects that can be marked (occupied) and unmarked
export class MarkedObjectPool {
  maxItems: number;
  marked: FrameBW[] = [];
  unmarked = new FrameBW();

  constructor(maxItems: number) {
    this.maxItems = maxItems;
  }

  get currentMarked() {
    return this.marked[0];
  }

  get currentUnmarked() {
    return this.unmarked;
  }

  get isMaxed() {
    return this.maxItems - this.marked.length === 0;
  }

  mark() {
    if (this.isMaxed) {
      throw new Error("marking out of bounds");
    }
    this.marked.push(this.unmarked);
    this.unmarked = new FrameBW();
  }

  unmark(amount = 1) {
    if (amount > this.marked.length) {
      return this.marked.splice(0, this.marked.length);
    }
    return this.marked.splice(0, amount);
  }
}
export default MarkedObjectPool;
