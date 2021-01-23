const { range } = require("ramda");

export class TBL {
  static parse(buf) {
    const n = buf.readUInt16LE(0);

    return range(0, n).map((i) => {
      const offset = buf.readUInt16LE(2 + i * 2);

      let offsetNext = n;
      if (i != n) {
        offsetNext = buf.readUInt16LE(2 + (i + 1) * 2);
      }

      return buf.toString("utf8", offset, offsetNext);
    });
  }
}
