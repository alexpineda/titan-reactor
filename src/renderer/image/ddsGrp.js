export default (buf, buffersOnly = false) => {
  const filesize = buf.readUInt32LE(0);
  const frameCount = buf.readUInt16LE(4);
  const unknown = buf.readUInt16LE(6);

  let pos = 8;

  let frames = [];
  for (let i = 0; i < frameCount; i++) {
    const w = buf.readUInt16LE(pos + 4);
    const h = buf.readUInt16LE(pos + 6);
    const size = buf.readUInt32LE(pos + 8);
    const dds = buf.slice(pos + 12, pos + 12 + size);

    pos = pos + 12 + size;
    if (buffersOnly) {
      frames.push(dds);
    } else {
      frames.push({ i, w, h, size, dds });
    }
  }
  return frames;
};
