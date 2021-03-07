/**
 * Maintains two queues, one marked and the other unmarked moving between the two as mark() and unmark() are called.
 */
export default class MarkedObjectPool {
  constructor(items) {
    this.marked = [];
    this.unmarked = items;
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
    return this.unmarked[0];
  }

  /**
   * Alias for marked items
   */
  get items() {
    return this.marked;
  }

  /**
   * Get {length} number of items from the marked queue and unmark them
   * @param {Number} length
   */
  unshift(length = 1) {
    //@todo verify length is valid
    const size = Math.min(length, this.marked.length);
    return this.unmark(size);
  }

  /**
   * Mark {amount} number of items.
   * @param {Number} amount
   * @throws {Error}
   */
  mark(amount = 1) {
    if (amount > this.unmarked.length) {
      throw new Error("marking out of bounds");
    }
    const unmarked = this.unmarked.splice(0, amount);
    this.marked.push(...unmarked);
    return unmarked;
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
    const marked = this.marked.splice(0, amount);
    this.unmarked.push(...marked);
    return marked;
  }
}
