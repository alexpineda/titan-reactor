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

    const offsets = range(0, n).map((i) => buf.readUInt16LE(i * 2));

    const findlen = [...offsets, n];
    findlen.sort((a, b) => a - b);
    findlen.reverse();

    const lengths = {};

    for (let i = 1; i < n; i++) {
      const start = findlen[i];
      if (!lengths[start]) {
        const end = findlen[i - 1];
        lengths[start] = end - start;
      }
    }

    const strings = [];
    range(1, n).map((x) => {
      const o = offsets[x];
      const l = lengths[o];
      strings.push(buf.toString("ascii", o, o + l));
    });

    return strings;
  }
}
