export const removeAlphaChannel = (buf) => {
  const rgb = [];
  for (let pos = 0; pos < buf.byteLength; pos += 4) {
    rgb.concat([
      buf.readUInt8(pos),
      buf.readUInt8(pos + 1),
      buf.readUInt8(pos + 2),
    ]);
  }
  return Buffer.from(rgb);
};
