export default class MarkedList {
  constructor(items) {
    this.marked = [];
    this.unmarked = items;
  }

  get currentMarked() {
    return this.marked[0];
  }

  get currentUnmarked() {
    return this.unmarked[0];
  }

  get items() {
    return this.marked;
  }

  free(length = 1) {
    //@todo verify length is valid
    const size = Math.min(length, this.marked.length);
    return this.unmark(size);
  }

  mark(amount = 1) {
    if (amount > this.unmarked.length) {
      throw new Error("marking out of bounds");
    }
    const unmarked = this.unmarked.splice(0, amount);
    this.marked.push(...unmarked);
    return unmarked;
  }

  unmark(amount = 1) {
    if (amount > this.marked.length) {
      throw new Error("unmarking out of bounds");
    }
    const marked = this.marked.splice(0, amount);
    this.unmarked.push(...marked);
    return marked;
  }
}

// export default class MarkedCircularContainer {
//   constructor(items, intrusive = false) {
//     this.items = items;
//     this.markedIndex = 0;
//     this.unmarkedIndex = 0;
//     this.markedAmount = 0;
//     this.intrusive = intrusive;
//   }

//   get currentMarked() {
//     return this.items[this.markedIndex];
//   }

//   get currentUnmarked() {
//     if (this.unmarked === 0) {
//       return null;
//     }
//     return this.items[this.unmarkedIndex];
//   }

//   get unmarked() {
//     return this.items.length - this.markedAmount;
//   }

//   get marked() {
//     return this.markedAmount;
//   }

//   free(length = 1) {
//     //@todo verify length is valid

//     const size = Math.min(length, this.markedAmount);
//     let start = this.unmarkedIndex - size;

//     let items;
//     if (start < 0) {
//       start = items.length - start;
//     }

//     const end = start + size;
//     console.log(this.unmarkedIndex, start, end);
//     items = this.items.slice(start, end);
//     if (end > items.length) {
//       items.push(...items.slice(0, size - items.length));
//     }

//     this.unmark(size);
//     return items;
//   }

//   mark(amount = 1) {
//     if (amount > this.unmarked) {
//       throw new Error("marking out of bounds");
//     }
//     this.markedAmount += amount;
//     this.unmarkedIndex = (this.unmarkedIndex + amount) % this.items.length;
//   }

//   unmark(amount = 1) {
//     if (amount > this.markedAmount) {
//       throw new Error("unmarking out of bounds");
//     }
//     this.markedAmount -= amount;
//   }
// }

// export default class MarkedCircularContainer {
//   constructor(items, intrusive = false) {
//     this.items = items;
//     this.markedIndex = 0;
//     this.markedAmount = 0;
//     this.intrusive = intrusive;
//   }

//   get unmarkedIndex() {
//     return (this.markedIndex + this.markedAmount) % this.items.length;
//   }

//   get currentMarked() {
//     return this.items[this.markedIndex];
//   }

//   get currentUnmarked() {
//     if (this.unmarked === 0) {
//       return null;
//     }
//     return this.items[this.unmarkedIndex];
//   }

//   get unmarked() {
//     return this.items.length - this.markedAmount;
//   }

//   get marked() {
//     return this.markedAmount;
//   }

//   free(length = 1) {
//     //@todo verify length is valid

//     // const size = this.markedIndex + length;
//     // const end = this.markedIndex - length;
//     // const items = this.items.slice(this.markedIndex, end);
//     // if (max > this.items.length) {
//     //   items.push(...items.slice(0, max - items.length));
//     // }
//     // this.unmark(max);
//     return items;
//   }

//   mark(amount = 1) {
//     if (amount > this.unmarked) {
//       throw new Error("marking out of bounds");
//     }
//     this.markedAmount += amount;
//     this.markedIndex = (this.markedIndex + amount) % this.items.length;
//   }

//   unmark(amount = 1) {
//     if (amount > this.markedAmount) {
//       throw new Error("unmarking out of bounds");
//     }
//     this.markedAmount -= amount;
//   }
// }
