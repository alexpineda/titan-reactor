const b = require("benny");
const buffer = Buffer.alloc(100000);
const dataOffset = 0;
const dataLength = 100000 / 2;

b.suite(
  "Example",

  b.add("ArrayBuffer.slice", function () {
    new Uint8Array(
      buffer.buffer.slice(
        buffer.byteOffset + dataOffset,
        buffer.byteOffset + dataOffset + dataLength
      ),
      0,
      dataLength
    );
  }),

  b.add("subarray", function () {
    new Uint8ClampedArray(
      buffer.buffer,
      buffer.byteOffset,
      buffer.length
    ).subarray(dataOffset, dataOffset + dataLength);
  }),

  b.cycle(),
  b.complete()
);
