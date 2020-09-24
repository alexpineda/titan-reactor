const { range } = require("ramda");
const BufferList = require("bl");

export const DDSGrp = (buf) => {
  const bl = new BufferList(buf);

  const filesize = bl.readUInt32LE(0);
  const frameCount = bl.readUInt16LE(4);
  const unknown = bl.readUInt16LE(6);

  bl.consume(8);

  return range(0, frameCount).map((frame) => {
    const w = bl.readUInt16LE(4);
    const h = bl.readUInt16LE(6);
    const size = bl.readUInt32LE(8);
    const dds = bl.slice(12, 12 + size);
    bl.consume(12 + size);

    return {
      w,
      h,
      size,
      dds,
    };
  });
};
