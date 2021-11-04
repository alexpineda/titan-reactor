class StringDowngrader {
  constructor() {
    this.chunkName = "STRx";
  }

  downgrade(buffer) {
    const numStrings = buffer.readUInt32LE(0);
    const inHeaderSize = 4 + numStrings * 4;
    const outHeaderSize = 2 + numStrings * 2;
    const out = Buffer.alloc(
      outHeaderSize + (buffer.byteLength - inHeaderSize),
      0
    );
    out.writeUInt16LE(numStrings, 0);

    for (let i = 1; i < numStrings; i++) {
      const strxIndex = buffer.readUInt32LE(i * 4);
      const strxBuf = buffer.slice(strxIndex, buffer.indexOf(0, strxIndex) + 1);

      if (strxBuf.byteLength === 0) {
        continue;
      }

      const outIndex = strxIndex - inHeaderSize + outHeaderSize;
      out.writeUInt16LE(outIndex, i * 2);
      strxBuf.copy(out, outIndex);
    }

    return ["STR\x20", out];
  }
}

module.exports = StringDowngrader;
