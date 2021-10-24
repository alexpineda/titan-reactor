import FrameBW from "./FrameBW";

// a fixed pool of objects that can be marked (occupied) and unmarked
export default class MarkedObjectPool {
  maxItems: number;
  marked: FrameBW[] = [];
  unmarked = new FrameBW();

  constructor(maxItems: number) {
    this.maxItems = maxItems;
  }

  /**
   * Get the next marked item from the marked queue
   */
  get currentMarked() {
    return this.marked[0];
  }

  /**
   * Get the next unmarked item from the unmarked queue
   */
  get currentUnmarked() {
    return this.unmarked;
  }

  get isMaxed() {
    return this.maxItems - this.marked.length === 0;
  }

  /**
   * Mark {amount} number of items.
   * @throws {Error}
   */
  mark() {
    if (this.isMaxed) {
      throw new Error("marking out of bounds");
    }
    this.marked.push(this.unmarked);
    this.unmarked = new FrameBW();
  }

  /**
   * Unmark {amount} number of items.
   * @param {Number} amount
   * @throws {Error}
   */
  unmark(amount = 1) {
    if (amount > this.marked.length) {
      throw new Error("unmarking out of bounds");
    }
    return this.marked.splice(0, amount);
  }
}
